// Types pour le module OCR Multi-Moteurs

export type OcrProvider = 'tesseract' | 'sanad' | 'escriptorium' | 'kraken';
export type OcrDocumentType = 'printed' | 'handwritten' | 'mixed';
export type OcrJobStatus = 'pending' | 'preprocessing' | 'processing' | 'completed' | 'failed' | 'partial';

export interface OcrPreprocessingOptions {
  deskew: boolean;
  denoise: boolean;
  binarization: 'adaptive' | 'otsu' | 'sauvola' | 'none';
  target_dpi: number;
  line_segmentation: boolean;
}

export interface OcrJob {
  id: string;
  user_id: string | null;
  document_id: string | null;
  document_type: OcrDocumentType;
  selected_provider: OcrProvider | null;
  recommended_provider: OcrProvider | null;
  auto_mode: boolean;
  cloud_allowed: boolean;
  source_file_url: string | null;
  source_file_name: string | null;
  source_file_hash: string | null;
  total_pages: number;
  processed_pages: number;
  preprocessing_options: OcrPreprocessingOptions;
  languages: string[];
  status: OcrJobStatus;
  overall_confidence: number | null;
  unknown_char_ratio: number | null;
  processing_time_ms: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface OcrPage {
  id: string;
  job_id: string;
  page_number: number;
  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  provider_used: OcrProvider | null;
  recognized_text: string | null;
  confidence: number | null;
  unknown_char_count: number;
  processing_time_ms: number | null;
  regions: OcrRegion[] | null;
  line_count: number;
  page_xml: string | null;
  alto_xml: string | null;
  meta_json: Record<string, any> | null;
  status: OcrJobStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface OcrRegion {
  id: string;
  type: 'text' | 'image' | 'table' | 'marginalia';
  coords: { x: number; y: number; width: number; height: number };
  lines: OcrLine[];
}

export interface OcrLine {
  id: string;
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  baseline?: { x1: number; y1: number; x2: number; y2: number };
}

export interface OcrGroundTruth {
  id: string;
  job_id: string;
  page_id: string | null;
  page_number: number;
  line_id: string | null;
  line_index: number | null;
  bbox: { x: number; y: number; width: number; height: number } | null;
  recognized_text: string;
  corrected_text: string;
  is_validated: boolean;
  correction_type: 'spelling' | 'segmentation' | 'missing' | 'extra' | null;
  created_by: string | null;
  validated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OcrModel {
  id: string;
  provider: OcrProvider;
  model_name: string;
  model_version: string | null;
  model_path: string | null;
  is_pretrained: boolean;
  trained_on_jobs: string[] | null;
  training_samples_count: number;
  accuracy: number | null;
  cer: number | null;
  wer: number | null;
  test_set_size: number | null;
  is_active: boolean;
  is_default: boolean;
  description: string | null;
  supported_scripts: string[];
  meta_json: Record<string, any> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OcrProviderConfig {
  id: string;
  provider: OcrProvider;
  is_enabled: boolean;
  is_cloud: boolean;
  base_url: string | null;
  api_version: string | null;
  default_options: Record<string, any> | null;
  rate_limit_per_minute: number | null;
  rate_limit_per_day: number | null;
  current_usage_today: number;
  description: string | null;
  documentation_url: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OcrAuditLog {
  id: string;
  job_id: string | null;
  page_id: string | null;
  action: string;
  provider: OcrProvider | null;
  sent_to_cloud: boolean;
  cloud_endpoint: string | null;
  file_hash: string | null;
  file_size_bytes: number | null;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  duration_ms: number | null;
  request_data: Record<string, any> | null;
  response_summary: Record<string, any> | null;
  created_at: string;
}

// Provider recommendation result
export interface ProviderRecommendation {
  recommended: OcrProvider;
  reasons: string[];
  alternatives: { provider: OcrProvider; score: number; reason: string }[];
  document_analysis: {
    is_handwritten: boolean;
    has_columns: boolean;
    needs_line_segmentation: boolean;
    estimated_quality: 'low' | 'medium' | 'high';
    detected_scripts: string[];
  };
}

// Export formats
export type ExportFormat = 'txt' | 'docx' | 'json' | 'pdf_searchable' | 'alto' | 'page_xml';

export interface ExportOptions {
  format: ExportFormat;
  include_confidence: boolean;
  include_coordinates: boolean;
  merge_pages: boolean;
}
