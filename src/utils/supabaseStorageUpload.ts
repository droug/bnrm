import * as tus from "tus-js-client";

type UploadProgressCb = (bytesUploaded: number, bytesTotal: number) => void;

type UploadOpts = {
  baseUrl: string;
  apikey?: string;
  bucket: string;
  filePath: string;
  file: File;
  accessToken: string;
  upsert?: boolean;
  cacheControl?: string;
  onProgress?: UploadProgressCb;
};

function toStorageBaseUrl(baseUrl: string) {
  // Prefer direct Storage hostname (bypasses some gateway limits)
  // https://PROJECT.supabase.co -> https://PROJECT.storage.supabase.co
  return baseUrl.replace(/\.supabase\.co\/?$/i, ".storage.supabase.co");
}

function isPayloadTooLarge(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("payload too large") ||
    m.includes("413") ||
    m.includes("exceeded the maximum")
  );
}

async function uploadDirectXHR(opts: UploadOpts): Promise<void> {
  const {
    baseUrl,
    apikey,
    bucket,
    filePath,
    file,
    accessToken,
    upsert = true,
    cacheControl = "3600",
    onProgress,
  } = opts;

  const uploadUrl = `${baseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${filePath}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(event.loaded, event.total);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      let errorMessage = `Erreur d'upload (${xhr.status})`;
      try {
        const response = JSON.parse(xhr.responseText);
        if (response?.error || response?.message) {
          errorMessage = response.error || response.message;
        }
      } catch {
        errorMessage = xhr.statusText || errorMessage;
      }
      reject(new Error(errorMessage));
    });

    xhr.addEventListener("error", () => reject(new Error("Erreur réseau lors du téléversement")));
    xhr.addEventListener("abort", () => reject(new Error("Téléversement annulé")));

    // NB: Supabase Storage accepte POST pour l'upload (PUT est aussi possible),
    // on garde POST car c'est déjà utilisé dans l'app.
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    if (apikey) xhr.setRequestHeader("apikey", apikey);
    if (upsert) xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("Cache-Control", cacheControl);
    xhr.send(file);
  });
}

async function uploadResumableTus(opts: UploadOpts): Promise<void> {
  const {
    baseUrl,
    apikey,
    bucket,
    filePath,
    file,
    accessToken,
    upsert = true,
    cacheControl = "3600",
    onProgress,
  } = opts;

  const endpoint = `${toStorageBaseUrl(baseUrl).replace(/\/$/, "")}/storage/v1/upload/resumable`;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      // Some proxies reject large request bodies during the initial POST when
      // uploadDataDuringCreation=true. Keep chunks small to avoid 413.
      chunkSize: 4 * 1024 * 1024, // 4MB chunks
      retryDelays: [0, 1000, 3000, 5000, 10000],
      // Avoid sending the first chunk in the creation request (POST), which can
      // trigger "Maximum size exceeded" on certain gateways.
      uploadDataDuringCreation: false,
      removeFingerprintOnSuccess: true,
      headers: {
        // tus-js-client / Supabase docs utilisent souvent 'authorization' en minuscule
        authorization: `Bearer ${accessToken}`,
        ...(apikey ? { apikey } : {}),
        ...(upsert ? { "x-upsert": "true" } : {}),
      },
      metadata: {
        bucketName: bucket,
        objectName: filePath,
        contentType: file.type || "application/octet-stream",
        cacheControl,
      },
      onError: (error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress?.(bytesUploaded, bytesTotal);
      },
      onSuccess: () => resolve(),
    });

    upload.start();
  });
}

/**
 * Supabase Storage a souvent une limite ~50MB sur l'upload "direct".
 * Pour les fichiers volumineux, on bascule automatiquement vers l'upload resumable (TUS).
 */
export async function uploadToSupabaseStorage(opts: UploadOpts): Promise<void> {
  const DIRECT_SAFE_LIMIT_BYTES = 45 * 1024 * 1024; // marge sous ~50MB

  if (opts.file.size > DIRECT_SAFE_LIMIT_BYTES) {
    return uploadResumableTus(opts);
  }

  try {
    return await uploadDirectXHR(opts);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isPayloadTooLarge(msg)) {
      return uploadResumableTus(opts);
    }
    throw e;
  }
}
