/**
 * Services pour gérer la hiérarchie des catalogues
 * CBM > CBN > Bibliothèque Numérique > Manuscrits
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================
// TYPES
// ============================================

export interface CBMCatalogRecord {
  id: string;
  cbm_record_id: string;
  source_library: string;
  title: string;
  title_ar?: string;
  author?: string;
  author_ar?: string;
  publication_year?: number;
  publisher?: string;
  isbn?: string;
  dewey_classification?: string;
  subject_headings?: string[];
  library_name: string;
  library_code: string;
  shelf_location?: string;
  document_type?: string;
  availability_status: string;
  cbn_document_id?: string;
  metadata_source?: string;
  last_sync_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CBNDocument {
  id: string;
  cote: string;
  unimarc_record_id?: string;
  title: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  author?: string;
  author_ar?: string;
  secondary_authors?: string[];
  publisher?: string;
  publication_place?: string;
  publication_year?: number;
  edition?: string;
  pages_count?: number;
  dimensions?: string;
  physical_description?: string;
  dewey_classification?: string;
  subject_headings?: string[];
  keywords?: string[];
  collection_name?: string;
  isbn?: string;
  issn?: string;
  document_type: string;
  support_type?: string;
  physical_status: string;
  location?: string;
  shelf_location?: string;
  is_digitized: boolean;
  digital_library_document_id?: string;
  access_level: string;
  consultation_mode?: string;
  cbm_catalog_id?: string;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DigitalLibraryDocument {
  id: string;
  cbn_document_id: string;
  digitization_date?: string;
  digitization_quality?: string;
  file_format?: string;
  file_size_mb?: number;
  pages_count: number;
  ocr_processed: boolean;
  pdf_url?: string;
  thumbnail_url?: string;
  cover_image_url?: string;
  title: string;
  title_ar?: string;
  author?: string;
  publication_year?: number;
  document_type?: string;
  digital_collections?: string[];
  themes?: string[];
  language?: string;
  access_level: string;
  requires_authentication: boolean;
  download_enabled: boolean;
  print_enabled: boolean;
  views_count: number;
  downloads_count: number;
  is_manuscript: boolean;
  manuscript_id?: string;
  publication_status: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// CBM CATALOG SERVICE (Niveau 1 - Fédéré)
// ============================================

export class CBMService {
  /**
   * Recherche fédérée dans tout le catalogue CBM
   */
  static async search(query: string, filters?: {
    library?: string;
    documentType?: string;
    yearFrom?: number;
    yearTo?: number;
  }) {
    let queryBuilder = supabase
      .from('cbm_catalog')
      .select('*')
      .is('deleted_at', null);

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%`);
    }

    if (filters?.library) {
      queryBuilder = queryBuilder.eq('library_code', filters.library);
    }

    if (filters?.documentType) {
      queryBuilder = queryBuilder.eq('document_type', filters.documentType);
    }

    if (filters?.yearFrom) {
      queryBuilder = queryBuilder.gte('publication_year', filters.yearFrom);
    }

    if (filters?.yearTo) {
      queryBuilder = queryBuilder.lte('publication_year', filters.yearTo);
    }

    const { data, error } = await queryBuilder.order('title');

    if (error) throw error;
    return data as CBMCatalogRecord[];
  }

  /**
   * Récupérer un document CBM avec ses liens vers CBN
   */
  static async getById(id: string) {
    const { data, error } = await supabase
      .from('cbm_catalog')
      .select(`
        *,
        cbn_document:cbn_documents(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Vérifier si un document CBM est disponible à la BNRM
   */
  static async isBNRMDocument(id: string): Promise<boolean> {
    const { data } = await supabase
      .from('cbm_catalog')
      .select('source_library, cbn_document_id')
      .eq('id', id)
      .single();

    return data?.source_library === 'BNRM' && !!data?.cbn_document_id;
  }
}

// ============================================
// CBN DOCUMENTS SERVICE (Niveau 2 - BNRM)
// ============================================

export class CBNService {
  /**
   * Recherche dans le catalogue BNRM
   */
  static async search(query: string, filters?: {
    documentType?: string;
    isDigitized?: boolean;
    accessLevel?: string;
  }) {
    let queryBuilder = supabase
      .from('cbn_documents')
      .select('*')
      .is('deleted_at', null);

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%,cote.ilike.%${query}%`);
    }

    if (filters?.documentType) {
      queryBuilder = queryBuilder.eq('document_type', filters.documentType);
    }

    if (filters?.isDigitized !== undefined) {
      queryBuilder = queryBuilder.eq('is_digitized', filters.isDigitized);
    }

    if (filters?.accessLevel) {
      queryBuilder = queryBuilder.eq('access_level', filters.accessLevel);
    }

    const { data, error } = await queryBuilder.order('title');

    if (error) throw error;
    return data as CBNDocument[];
  }

  /**
   * Récupérer un document CBN avec tous ses liens
   */
  static async getById(id: string) {
    const { data, error } = await supabase
      .from('cbn_documents')
      .select(`
        *,
        cbm_record:cbm_catalog(*),
        digital_document:digital_library_documents(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Récupérer un document par sa cote
   */
  static async getByCote(cote: string) {
    const { data, error } = await supabase
      .from('cbn_documents')
      .select('*')
      .eq('cote', cote)
      .single();

    if (error) throw error;
    return data as CBNDocument;
  }

  /**
   * Vérifier si un document est numérisé
   */
  static async isDigitized(id: string): Promise<boolean> {
    const { data } = await supabase
      .from('cbn_documents')
      .select('is_digitized, digital_library_document_id')
      .eq('id', id)
      .single();

    return data?.is_digitized && !!data?.digital_library_document_id;
  }
}

// ============================================
// DIGITAL LIBRARY SERVICE (Niveau 3 - Numérique)
// ============================================

export class DigitalLibraryService {
  /**
   * Recherche dans la bibliothèque numérique
   */
  static async search(query: string, filters?: {
    documentType?: string;
    collection?: string;
    theme?: string;
    language?: string;
    isManuscript?: boolean;
  }) {
    let queryBuilder = supabase
      .from('digital_library_documents')
      .select('*')
      .is('deleted_at', null)
      .eq('publication_status', 'published');

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%`);
    }

    if (filters?.documentType) {
      queryBuilder = queryBuilder.eq('document_type', filters.documentType);
    }

    if (filters?.collection) {
      queryBuilder = queryBuilder.contains('digital_collections', [filters.collection]);
    }

    if (filters?.theme) {
      queryBuilder = queryBuilder.contains('themes', [filters.theme]);
    }

    if (filters?.language) {
      queryBuilder = queryBuilder.eq('language', filters.language);
    }

    if (filters?.isManuscript !== undefined) {
      queryBuilder = queryBuilder.eq('is_manuscript', filters.isManuscript);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) throw error;
    return data as DigitalLibraryDocument[];
  }

  /**
   * Récupérer un document numérique avec métadonnées complètes
   */
  static async getById(id: string) {
    const { data, error } = await supabase
      .from('digital_library_documents')
      .select(`
        *,
        cbn_document:cbn_documents(*),
        manuscript:manuscripts(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Incrémenter le compteur de vues
   */
  static async incrementViews(id: string) {
    const { data: current } = await supabase
      .from('digital_library_documents')
      .select('views_count')
      .eq('id', id)
      .single();

    if (current) {
      const { error } = await supabase
        .from('digital_library_documents')
        .update({ views_count: (current.views_count || 0) + 1 })
        .eq('id', id);
      
      if (error) console.error('Error incrementing views:', error);
    }
  }

  /**
   * Incrémenter le compteur de téléchargements
   */
  static async incrementDownloads(id: string) {
    const { data: current } = await supabase
      .from('digital_library_documents')
      .select('downloads_count')
      .eq('id', id)
      .single();

    if (current) {
      const { error } = await supabase
        .from('digital_library_documents')
        .update({ downloads_count: (current.downloads_count || 0) + 1 })
        .eq('id', id);
      
      if (error) console.error('Error incrementing downloads:', error);
    }
  }

  /**
   * Vérifier si c'est un manuscrit
   */
  static async isManuscript(id: string): Promise<boolean> {
    const { data } = await supabase
      .from('digital_library_documents')
      .select('is_manuscript, manuscript_id')
      .eq('id', id)
      .single();

    return data?.is_manuscript && !!data?.manuscript_id;
  }
}

// ============================================
// NAVIGATION HELPER
// ============================================

export class CatalogNavigationHelper {
  /**
   * Obtenir le chemin de navigation complet d'un document
   */
  static async getNavigationPath(startLevel: 'cbm' | 'cbn' | 'digital' | 'manuscript', id: string) {
    const path: Array<{ level: string; id: string; title: string; url: string }> = [];

    if (startLevel === 'manuscript') {
      // Manuscrit → Digital Library → CBN → CBM
      const { data: manuscript } = await supabase
        .from('manuscripts')
        .select('*, digital_library_documents(*), cbn_documents(*)')
        .eq('id', id)
        .single();

      if (manuscript) {
        path.push({
          level: 'manuscript',
          id: manuscript.id,
          title: manuscript.title,
          url: `/manuscripts/${manuscript.id}`
        });

        if (manuscript.digital_library_documents) {
          path.push({
            level: 'digital',
            id: manuscript.digital_library_documents.id,
            title: manuscript.digital_library_documents.title,
            url: `/digital-library/document/${manuscript.digital_library_documents.id}`
          });
        }

        if (manuscript.cbn_documents) {
          path.push({
            level: 'cbn',
            id: manuscript.cbn_documents.id,
            title: manuscript.cbn_documents.title,
            url: `/cbn/notice/${manuscript.cbn_documents.id}`
          });
        }
      }
    }

    // ... Autres niveaux à implémenter selon besoin

    return path.reverse(); // Du plus général au plus spécifique
  }

  /**
   * Obtenir les liens disponibles à partir d'un niveau
   */
  static async getAvailableLinks(level: 'cbm' | 'cbn' | 'digital' | 'manuscript', id: string) {
    const links: Array<{ type: string; url: string; label: string }> = [];

    switch (level) {
      case 'cbm': {
        const doc = await CBMService.getById(id);
        if (doc.cbn_document_id) {
          links.push({
            type: 'cbn',
            url: `/cbn/notice/${doc.cbn_document_id}`,
            label: 'Voir la notice complète BNRM'
          });
        }
        break;
      }

      case 'cbn': {
        const doc = await CBNService.getById(id);
        if (doc.cbm_catalog_id) {
          links.push({
            type: 'cbm',
            url: `/cbm/notice/${doc.cbm_catalog_id}`,
            label: 'Voir dans le catalogue marocain'
          });
        }
        if (doc.digital_library_document_id) {
          links.push({
            type: 'digital',
            url: `/digital-library/document/${doc.digital_library_document_id}`,
            label: 'Consulter la version numérique'
          });
        }
        break;
      }

      case 'digital': {
        const doc = await DigitalLibraryService.getById(id);
        if (doc.cbn_document_id) {
          links.push({
            type: 'cbn',
            url: `/cbn/notice/${doc.cbn_document_id}`,
            label: 'Voir la notice BNRM complète'
          });
        }
        if (doc.manuscript_id) {
          links.push({
            type: 'manuscript',
            url: `/manuscripts/${doc.manuscript_id}`,
            label: 'Accéder à la plateforme manuscrits'
          });
        }
        break;
      }
    }

    return links;
  }
}
