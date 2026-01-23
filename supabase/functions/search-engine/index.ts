import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const typesenseHost = Deno.env.get('TYPESENSE_HOST');
const typesenseApiKey = Deno.env.get('TYPESENSE_API_KEY');

// Validate Typesense configuration
if (!typesenseHost || !typesenseHost.startsWith('http')) {
  throw new Error(`TYPESENSE_HOST must be a valid URL starting with http:// or https://. Current value: ${typesenseHost || 'not set'}`);
}

if (!typesenseApiKey) {
  throw new Error('TYPESENSE_API_KEY environment variable is not set');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TypesenseDocument {
  id: string;
  title: string;
  title_ar?: string;
  content: string;
  excerpt?: string;
  content_type: string;
  language: string;
  keywords: string[];
  semantic_keywords: string[];
  author: string;
  publisher?: string;
  publication_year?: number;
  genre?: string;
  category?: string;
  tags?: string[];
  url: string;
  published_at: number;
  access_level: string;
  is_featured: boolean;
  view_count: number;
  status: string;
  source_table: string;
}

// Semantic keyword mappings to expand search field
const SEMANTIC_EXPANSIONS: Record<string, string[]> = {
  // French semantic expansions
  'bibliothèque': ['librairie', 'médiathèque', 'archives', 'documentation', 'livres', 'lecture'],
  'manuscrit': ['codex', 'parchemin', 'texte ancien', 'document historique', 'écrit'],
  'exposition': ['galerie', 'musée', 'vernissage', 'collection', 'art', 'oeuvres'],
  'événement': ['manifestation', 'activité', 'programme', 'cérémonie', 'célébration'],
  'patrimoine': ['héritage', 'culture', 'tradition', 'histoire', 'conservation'],
  'numérisation': ['digitalisation', 'scan', 'archive numérique', 'dématérialisation'],
  'recherche': ['étude', 'investigation', 'exploration', 'documentation'],
  'catalogue': ['répertoire', 'inventaire', 'base de données', 'collection'],
  'lecture': ['consultation', 'étude', 'parcours', 'découverte'],
  'formation': ['apprentissage', 'éducation', 'atelier', 'cours', 'enseignement'],
  
  // Arabic semantic expansions
  'مكتبة': ['كتب', 'قراءة', 'مراجع', 'وثائق', 'أرشيف'],
  'مخطوط': ['نص قديم', 'وثيقة تاريخية', 'تراث مكتوب', 'رق'],
  'معرض': ['فن', 'ثقافة', 'مجموعة', 'عرض', 'متحف'],
  'تراث': ['ثقافة', 'تقاليد', 'تاريخ', 'حفظ', 'إرث'],
  'رقمنة': ['تحويل رقمي', 'أرشفة إلكترونية', 'مسح ضوئي'],
  
  // English semantic expansions
  'library': ['books', 'reading', 'archives', 'documentation', 'collection'],
  'manuscript': ['codex', 'parchment', 'ancient text', 'historical document'],
  'exhibition': ['gallery', 'museum', 'art show', 'collection', 'display'],
  'heritage': ['culture', 'tradition', 'history', 'conservation', 'legacy'],
  'digitization': ['scanning', 'digital archive', 'preservation'],
};

const searchSchema = {
  name: 'bnrm_search',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string', facet: false },
    { name: 'title_ar', type: 'string', optional: true, facet: false },
    { name: 'content', type: 'string', facet: false },
    { name: 'excerpt', type: 'string', optional: true, facet: false },
    { name: 'content_type', type: 'string', facet: true },
    { name: 'language', type: 'string', facet: true },
    { name: 'keywords', type: 'string[]', facet: true },
    { name: 'semantic_keywords', type: 'string[]', facet: false },
    { name: 'author', type: 'string', facet: true },
    { name: 'publisher', type: 'string', optional: true, facet: true },
    { name: 'publication_year', type: 'int32', optional: true, facet: true },
    { name: 'genre', type: 'string', optional: true, facet: true },
    { name: 'category', type: 'string', optional: true, facet: true },
    { name: 'tags', type: 'string[]', optional: true, facet: true },
    { name: 'url', type: 'string', facet: false },
    { name: 'published_at', type: 'int64', facet: false },
    { name: 'access_level', type: 'string', facet: true },
    { name: 'is_featured', type: 'bool', facet: true },
    { name: 'view_count', type: 'int32', facet: false },
    { name: 'status', type: 'string', facet: true },
    { name: 'source_table', type: 'string', facet: true }
  ],
  default_sorting_field: 'published_at',
  token_separators: ['-', '_', '.'],
  symbols_to_index: ['#', '@']
};

async function makeTypesenseRequest(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${typesenseHost}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'X-TYPESENSE-API-KEY': typesenseApiKey,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  console.log(`Making Typesense request: ${method} ${url}`);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Typesense request failed: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Typesense request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

async function initializeSchema() {
  try {
    // Try to get existing collection
    await makeTypesenseRequest('/collections/bnrm_search');
    console.log('Collection already exists');
  } catch (error) {
    // Collection doesn't exist, create it
    console.log('Creating new collection...');
    await makeTypesenseRequest('/collections', 'POST', searchSchema);
    console.log('Collection created successfully');
  }
}

async function indexContent() {
  console.log('Starting comprehensive content indexation...');
  
  const documents: TypesenseDocument[] = [];
  let totalIndexed = 0;

  // 1. Index published content
  console.log('Indexing content table...');
  const { data: content, error: contentError } = await supabase
    .from('content')
    .select(`
      id, title, content_body, excerpt, content_type, tags,
      published_at, created_at, slug, is_featured, view_count, author_id,
      profiles!content_author_id_fkey(first_name, last_name)
    `)
    .eq('status', 'published');

  if (contentError) {
    console.error('Error fetching content:', contentError);
  } else if (content) {
    for (const item of content) {
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      const authorName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
        : 'Anonyme';

      const keywords = generateKeywords(item.title, item.content_body, item.excerpt);
      const semanticKeywords = expandSemanticKeywords(keywords);
      const language = detectLanguage(item.content_body || item.title);
      const publishedDate = new Date(item.published_at || item.created_at);

      documents.push({
        id: `content_${item.id}`,
        title: item.title,
        content: item.content_body || '',
        excerpt: item.excerpt || '',
        content_type: item.content_type,
        language,
        keywords,
        semantic_keywords: semanticKeywords,
        author: authorName,
        publication_year: publishedDate.getFullYear(),
        tags: item.tags || [],
        url: `/content/${item.slug}`,
        published_at: Math.floor(publishedDate.getTime() / 1000),
        access_level: 'public',
        is_featured: item.is_featured || false,
        view_count: item.view_count || 0,
        status: 'published',
        source_table: 'content'
      });
    }
    console.log(`Prepared ${content.length} content items`);
  }

  // 2. Index CMS actualités (news)
  console.log('Indexing cms_actualites...');
  const { data: actualites, error: actualitesError } = await supabase
    .from('cms_actualites')
    .select('*')
    .eq('status', 'published');

  if (actualitesError) {
    console.error('Error fetching actualites:', actualitesError);
  } else if (actualites) {
    for (const item of actualites) {
      const keywords = generateKeywords(item.title_fr, item.body_fr, item.chapo_fr);
      const keywordsAr = generateKeywords(item.title_ar, item.body_ar, item.chapo_ar);
      const semanticKeywords = expandSemanticKeywords([...keywords, ...keywordsAr]);
      const publishedDate = new Date(item.published_at || item.date_publication || item.created_at);

      documents.push({
        id: `actualite_${item.id}`,
        title: item.title_fr || '',
        title_ar: item.title_ar || '',
        content: `${item.body_fr || ''} ${item.body_ar || ''}`,
        excerpt: item.chapo_fr || item.chapo_ar || '',
        content_type: 'news',
        language: 'fr',
        keywords: [...keywords, ...keywordsAr, ...(item.tags || [])],
        semantic_keywords: semanticKeywords,
        author: 'BNRM',
        category: item.category || '',
        tags: item.tags || [],
        url: `/actualites/${item.slug}`,
        published_at: Math.floor(publishedDate.getTime() / 1000),
        access_level: 'public',
        is_featured: false,
        view_count: item.view_count || 0,
        status: 'published',
        source_table: 'cms_actualites'
      });
    }
    console.log(`Prepared ${actualites.length} actualites`);
  }

  // 3. Index CMS events
  console.log('Indexing cms_evenements...');
  const { data: evenements, error: evenementsError } = await supabase
    .from('cms_evenements')
    .select('*')
    .eq('status', 'published');

  if (evenementsError) {
    console.error('Error fetching evenements:', evenementsError);
  } else if (evenements) {
    for (const item of evenements) {
      const keywords = generateKeywords(item.title_fr, item.description_fr, item.lieu);
      const keywordsAr = generateKeywords(item.title_ar, item.description_ar);
      const semanticKeywords = expandSemanticKeywords([...keywords, ...keywordsAr, 'événement', 'event']);
      const eventDate = new Date(item.date_debut || item.created_at);

      documents.push({
        id: `evenement_${item.id}`,
        title: item.title_fr || '',
        title_ar: item.title_ar || '',
        content: `${item.description_fr || ''} ${item.description_ar || ''}`,
        excerpt: item.description_fr?.substring(0, 200) || '',
        content_type: 'event',
        language: 'fr',
        keywords: [...keywords, ...keywordsAr],
        semantic_keywords: semanticKeywords,
        author: 'BNRM',
        category: item.type_evenement || '',
        url: `/evenements/${item.slug}`,
        published_at: Math.floor(eventDate.getTime() / 1000),
        access_level: 'public',
        is_featured: item.is_featured || false,
        view_count: item.view_count || 0,
        status: 'published',
        source_table: 'cms_evenements'
      });
    }
    console.log(`Prepared ${evenements.length} evenements`);
  }

  // 4. Index CMS pages
  console.log('Indexing cms_pages...');
  const { data: pages, error: pagesError } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('status', 'published');

  if (pagesError) {
    console.error('Error fetching pages:', pagesError);
  } else if (pages) {
    for (const item of pages) {
      const keywords = [
        ...generateKeywords(item.title_fr, item.content_fr),
        ...generateKeywords(item.title_ar, item.content_ar),
        ...(item.seo_keywords_fr || []),
        ...(item.seo_keywords_ar || [])
      ];
      const semanticKeywords = expandSemanticKeywords(keywords);
      const publishedDate = new Date(item.published_at || item.created_at);

      documents.push({
        id: `page_${item.id}`,
        title: item.title_fr || '',
        title_ar: item.title_ar || '',
        content: `${item.content_fr || ''} ${item.content_ar || ''}`,
        excerpt: item.seo_description_fr || item.seo_description_ar || '',
        content_type: 'page',
        language: 'fr',
        keywords,
        semantic_keywords: semanticKeywords,
        author: 'BNRM',
        url: `/${item.slug}`,
        published_at: Math.floor(publishedDate.getTime() / 1000),
        access_level: 'public',
        is_featured: false,
        view_count: 0,
        status: 'published',
        source_table: 'cms_pages'
      });
    }
    console.log(`Prepared ${pages.length} pages`);
  }

  // 5. Index manuscripts
  console.log('Indexing manuscripts...');
  const { data: manuscripts, error: manuscriptsError } = await supabase
    .from('manuscripts')
    .select('*');

  if (manuscriptsError) {
    console.error('Error fetching manuscripts:', manuscriptsError);
  } else if (manuscripts) {
    for (const manuscript of manuscripts) {
      const keywords = generateKeywords(manuscript.title, manuscript.description, manuscript.author);
      const semanticKeywords = expandSemanticKeywords([...keywords, 'manuscrit', 'مخطوط', 'manuscript']);
      const language = detectLanguage(manuscript.title || manuscript.description);
      const manuscriptDate = new Date(manuscript.created_at);
      
      documents.push({
        id: `manuscript_${manuscript.id}`,
        title: manuscript.title,
        content: manuscript.description || '',
        excerpt: manuscript.description?.substring(0, 200) || '',
        content_type: 'manuscript',
        language,
        keywords,
        semantic_keywords: semanticKeywords,
        author: manuscript.author || 'Inconnu',
        publication_year: manuscriptDate.getFullYear(),
        url: `/manuscripts/${manuscript.id}`,
        published_at: Math.floor(manuscriptDate.getTime() / 1000),
        access_level: manuscript.access_level || 'public',
        is_featured: false,
        view_count: 0,
        status: manuscript.status || 'available',
        source_table: 'manuscripts'
      });
    }
    console.log(`Prepared ${manuscripts.length} manuscripts`);
  }

  // 6. Index digital library documents
  console.log('Indexing digital_library_documents...');
  const { data: digitalDocs, error: digitalDocsError } = await supabase
    .from('digital_library_documents')
    .select('*')
    .eq('status', 'published');

  if (digitalDocsError) {
    console.error('Error fetching digital library documents:', digitalDocsError);
  } else if (digitalDocs) {
    for (const doc of digitalDocs) {
      const keywords = [
        ...generateKeywords(doc.title, doc.description, doc.author),
        ...(doc.keywords || [])
      ];
      const semanticKeywords = expandSemanticKeywords(keywords);
      const language = detectLanguage(doc.title || doc.description);
      const docDate = new Date(doc.publication_date || doc.created_at);

      documents.push({
        id: `digitaldoc_${doc.id}`,
        title: doc.title,
        title_ar: doc.title_ar || '',
        content: doc.description || '',
        excerpt: doc.description?.substring(0, 200) || '',
        content_type: doc.document_type || 'document',
        language,
        keywords,
        semantic_keywords: semanticKeywords,
        author: doc.author || 'Inconnu',
        publisher: doc.publisher || '',
        publication_year: docDate.getFullYear(),
        genre: doc.genre || '',
        category: doc.collection || '',
        url: `/digital-library/document/${doc.id}`,
        published_at: Math.floor(docDate.getTime() / 1000),
        access_level: doc.access_level || 'public',
        is_featured: doc.is_featured || false,
        view_count: doc.view_count || 0,
        status: 'published',
        source_table: 'digital_library_documents'
      });
    }
    console.log(`Prepared ${digitalDocs.length} digital library documents`);
  }

  // 7. Index VExpo exhibitions
  console.log('Indexing vexpo_exhibitions...');
  const { data: exhibitions, error: exhibitionsError } = await supabase
    .from('vexpo_exhibitions')
    .select('*')
    .eq('is_published', true);

  if (exhibitionsError) {
    console.error('Error fetching exhibitions:', exhibitionsError);
  } else if (exhibitions) {
    for (const expo of exhibitions) {
      const keywords = generateKeywords(expo.title_fr, expo.description_fr, expo.location);
      const keywordsAr = generateKeywords(expo.title_ar, expo.description_ar);
      const semanticKeywords = expandSemanticKeywords([...keywords, ...keywordsAr, 'exposition', 'معرض', 'exhibition', 'visite virtuelle']);
      const expoDate = new Date(expo.start_date || expo.created_at);

      documents.push({
        id: `exhibition_${expo.id}`,
        title: expo.title_fr || '',
        title_ar: expo.title_ar || '',
        content: `${expo.description_fr || ''} ${expo.description_ar || ''}`,
        excerpt: expo.description_fr?.substring(0, 200) || '',
        content_type: 'exhibition',
        language: 'fr',
        keywords: [...keywords, ...keywordsAr],
        semantic_keywords: semanticKeywords,
        author: 'BNRM',
        url: `/digital-library/vexpo/${expo.slug}`,
        published_at: Math.floor(expoDate.getTime() / 1000),
        access_level: 'public',
        is_featured: expo.is_featured || false,
        view_count: 0,
        status: 'published',
        source_table: 'vexpo_exhibitions'
      });
    }
    console.log(`Prepared ${exhibitions.length} exhibitions`);
  }

  // 8. Index CBN documents
  console.log('Indexing cbn_documents...');
  const { data: cbnDocs, error: cbnDocsError } = await supabase
    .from('cbn_documents')
    .select('*')
    .is('deleted_at', null);

  if (cbnDocsError) {
    console.error('Error fetching CBN documents:', cbnDocsError);
  } else if (cbnDocs) {
    for (const doc of cbnDocs) {
      const keywords = [
        ...generateKeywords(doc.title, doc.notes, doc.author),
        ...(doc.keywords || []),
        ...(doc.subject_headings || [])
      ];
      const semanticKeywords = expandSemanticKeywords(keywords);
      const language = detectLanguage(doc.title || doc.notes);
      const docDate = new Date(doc.created_at);

      documents.push({
        id: `cbndoc_${doc.id}`,
        title: doc.title,
        title_ar: doc.title_ar || '',
        content: doc.notes || '',
        excerpt: doc.notes?.substring(0, 200) || '',
        content_type: doc.document_type || 'book',
        language,
        keywords,
        semantic_keywords: semanticKeywords,
        author: doc.author || 'Inconnu',
        publisher: doc.publisher || '',
        publication_year: doc.publication_year || docDate.getFullYear(),
        category: doc.dewey_classification || '',
        url: `/cbn/catalogue/${doc.id}`,
        published_at: Math.floor(docDate.getTime() / 1000),
        access_level: doc.access_level || 'public',
        is_featured: false,
        view_count: 0,
        status: 'available',
        source_table: 'cbn_documents'
      });
    }
    console.log(`Prepared ${cbnDocs.length} CBN documents`);
  }

  // Clear existing documents and index new ones
  console.log(`Total documents to index: ${documents.length}`);
  
  try {
    await makeTypesenseRequest('/collections/bnrm_search/documents', 'DELETE');
    console.log('Cleared existing documents');
  } catch (error) {
    console.log('No existing documents to clear or error clearing:', error);
  }

  // Index documents in batches using JSONL format
  const batchSize = 100;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const jsonlData = batch.map(doc => JSON.stringify(doc)).join('\n');
    
    try {
      const response = await fetch(`${typesenseHost}/collections/bnrm_search/documents/import?action=upsert`, {
        method: 'POST',
        headers: {
          'X-TYPESENSE-API-KEY': typesenseApiKey!,
          'Content-Type': 'text/plain',
        },
        body: jsonlData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Batch import failed: ${response.status}`, errorText);
      } else {
        totalIndexed += batch.length;
        console.log(`Indexed ${totalIndexed}/${documents.length} documents`);
      }
    } catch (error) {
      console.error(`Error indexing batch ${i}:`, error);
    }
  }

  console.log(`Content indexation completed. Total indexed: ${totalIndexed}`);
  return { 
    indexed: totalIndexed,
    breakdown: {
      content: content?.length || 0,
      actualites: actualites?.length || 0,
      evenements: evenements?.length || 0,
      pages: pages?.length || 0,
      manuscripts: manuscripts?.length || 0,
      digital_library: digitalDocs?.length || 0,
      exhibitions: exhibitions?.length || 0,
      cbn_documents: cbnDocs?.length || 0
    }
  };
}

function generateKeywords(title: string = '', content: string = '', excerpt: string = ''): string[] {
  const text = `${title} ${content} ${excerpt}`.toLowerCase();
  
  // Remove common stop words in multiple languages
  const stopWords = new Set([
    // French
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or',
    'dans', 'sur', 'avec', 'sans', 'pour', 'par', 'vers', 'chez', 'sous', 'entre', 'pendant',
    'ce', 'cette', 'ces', 'celui', 'celle', 'ceux', 'celles', 'qui', 'que', 'quoi', 'dont', 'où',
    'son', 'sa', 'ses', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se',
    'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 'falloir', 'vouloir',
    'tout', 'tous', 'toute', 'toutes', 'autre', 'autres', 'même', 'mêmes',
    'grand', 'grande', 'grands', 'grandes', 'petit', 'petite', 'petits', 'petites',
    'bon', 'bonne', 'bons', 'bonnes', 'mauvais', 'mauvaise', 'mauvaises',
    'premier', 'première', 'premiers', 'premières', 'dernier', 'dernière', 'derniers', 'dernières',
    'nouveau', 'nouvelle', 'nouveaux', 'nouvelles', 'ancien', 'ancienne', 'anciens', 'anciennes',
    
    // English
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
    
    // Arabic (basic stop words)
    'في', 'من', 'إلى', 'على', 'عن', 'مع', 'بعد', 'قبل', 'تحت', 'فوق', 'بين', 'خلال',
    'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'اللذان', 'اللتان', 'اللذين', 'اللتين',
    'أن', 'إن', 'كان', 'كانت', 'ليس', 'ليست', 'لا', 'ما', 'لم', 'لن', 'قد', 'لقد',
    'أنا', 'أنت', 'هو', 'هي', 'نحن', 'أنتم', 'هم', 'هن',
    
    // Amazigh/Berber
    'ⴷ', 'ⵏ', 'ⴳ', 'ⵙ', 'ⵅⴼ', 'ⴰⵔ', 'ⴰⴷ'
  ]);

  // Extract words (minimum 3 characters, alphanumeric + some special chars)
  const words = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\u2D30-\u2D7F\w]{3,}/g) || [];
  
  // Filter out stop words and get unique keywords
  const keywords = [...new Set(
    words
      .filter(word => !stopWords.has(word))
      .slice(0, 30) // Limit to 30 keywords
  )];

  return keywords;
}

function expandSemanticKeywords(keywords: string[]): string[] {
  const expanded: Set<string> = new Set();
  
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    
    // Add original keyword
    expanded.add(lowerKeyword);
    
    // Check for semantic expansions
    for (const [term, expansions] of Object.entries(SEMANTIC_EXPANSIONS)) {
      if (lowerKeyword.includes(term.toLowerCase()) || term.toLowerCase().includes(lowerKeyword)) {
        expansions.forEach(exp => expanded.add(exp.toLowerCase()));
      }
    }
  }
  
  return [...expanded].slice(0, 50); // Limit to 50 semantic keywords
}

function detectLanguage(text: string): string {
  if (!text) return 'fr';
  
  // Simple language detection based on character patterns
  const arabicPattern = /[\u0600-\u06FF]/;
  const berberPattern = /[\u2D30-\u2D7F]/; // Tifinagh script
  const frenchPattern = /[àâäéèêëïîôöùûüÿç]/i;
  const englishPattern = /\b(the|and|is|are|was|were|have|has|been)\b/i;
  
  if (arabicPattern.test(text)) return 'ar';
  if (berberPattern.test(text)) return 'ber';
  if (englishPattern.test(text)) return 'en';
  if (frenchPattern.test(text)) return 'fr';
  
  // Default to French if no specific pattern detected
  return 'fr';
}

async function searchContent(query: string, options: any = {}) {
  const {
    language = '',
    content_type = '',
    author = '',
    category = '',
    publisher = '',
    genre = '',
    publication_year = '',
    publication_month = '',
    access_level = '',
    page = 1,
    per_page = 10,
    sort_by = 'published_at:desc',
    user_role = 'visitor',
    show_hidden = false
  } = options;

  console.log(`Searching for: "${query}" with options:`, options);

  // Build filter query
  const filters: string[] = [];
  
  if (language) {
    const langs = language.split(',');
    filters.push(`language:[${langs.join(',')}]`);
  }
  if (content_type) {
    const types = content_type.split(',');
    filters.push(`content_type:[${types.join(',')}]`);
  }
  if (author) {
    const authors = author.split(',');
    filters.push(`author:[${authors.join(',')}]`);
  }
  if (category) {
    const categories = category.split(',');
    filters.push(`category:[${categories.join(',')}]`);
  }
  if (publisher) {
    const publishers = publisher.split(',');
    filters.push(`publisher:[${publishers.join(',')}]`);
  }
  if (genre) {
    const genres = genre.split(',');
    filters.push(`genre:[${genres.join(',')}]`);
  }
  if (publication_year) {
    filters.push(`publication_year:=${publication_year}`);
  }
  
  // Hide unpublished/hidden content unless explicitly requested
  if (!show_hidden) {
    filters.push('status:[published,available]');
  }
  
  // Apply access level restrictions based on user role
  if (user_role === 'visitor' || user_role === 'public_user') {
    filters.push('access_level:=public');
  }

  const searchParams: Record<string, string> = {
    q: query || '*',
    query_by: 'title,title_ar,content,excerpt,keywords,semantic_keywords,author,publisher,genre,category',
    sort_by: sort_by,
    page: page.toString(),
    per_page: Math.min(per_page, 50).toString(),
    highlight_full_fields: 'title,title_ar,content,excerpt',
    highlight_affix_num_tokens: '8',
    snippet_threshold: '20',
    max_candidates: '200',
    num_typos: '2',
    typo_tokens_threshold: '1',
    prefix: 'true',
    exhaustive_search: 'true',
    facet_by: 'content_type,language,author,category,publisher,genre,publication_year,access_level,is_featured,status,source_table'
  };

  if (filters.length > 0) {
    searchParams.filter_by = filters.join(' && ');
  }

  try {
    const results = await makeTypesenseRequest(
      `/collections/bnrm_search/documents/search?${new URLSearchParams(searchParams).toString()}`
    );

    console.log(`Search completed. Found ${results.found} results in ${results.search_time_ms}ms`);
    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

async function getSuggestions(query: string, options: any = {}) {
  const {
    language = '',
    content_type = '',
    limit = 8
  } = options;

  if (query.length < 2) {
    return { suggestions: [] };
  }

  const filters: string[] = ['status:[published,available]'];
  if (language) filters.push(`language:=${language}`);
  if (content_type) filters.push(`content_type:=${content_type}`);

  const searchParams: Record<string, string> = {
    q: query,
    query_by: 'title,title_ar,keywords,semantic_keywords',
    per_page: limit.toString(),
    prefix: 'true',
    num_typos: '2',
    filter_by: filters.join(' && ')
  };

  try {
    const results = await makeTypesenseRequest(
      `/collections/bnrm_search/documents/search?${new URLSearchParams(searchParams).toString()}`
    );

    const suggestions = results.hits?.map((hit: any) => ({
      text: hit.document.title,
      text_ar: hit.document.title_ar,
      type: hit.document.content_type,
      source: hit.document.source_table,
      url: hit.document.url
    })) || [];

    return { suggestions };
  } catch (error) {
    console.error('Suggestions error:', error);
    return { suggestions: [] };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Initialize schema on first request
    await initializeSchema();

    // Handle body parsing for POST requests
    let body: any = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch (e) {
        // No body or invalid JSON
      }
    }

    switch (action) {
      case 'index':
        console.log('Starting full indexation...');
        const indexResult = await indexContent();
        return new Response(JSON.stringify(indexResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'search':
        const { query: searchQuery, ...searchOptions } = body;
        const searchResults = await searchContent(searchQuery, searchOptions);
        return new Response(JSON.stringify(searchResults), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'suggest':
        const { query: suggestQuery, ...suggestOptions } = body;
        const suggestions = await getSuggestions(suggestQuery, suggestOptions);
        return new Response(JSON.stringify(suggestions), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        // Default action: search if query provided, otherwise return info
        if (body.query) {
          const defaultSearchResults = await searchContent(body.query, body);
          return new Response(JSON.stringify(defaultSearchResults), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // If limit provided, return suggestions
        if (body.limit) {
          const defaultSuggestions = await getSuggestions(body.query || '', body);
          return new Response(JSON.stringify(defaultSuggestions), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          message: 'BNRM Search Engine',
          actions: ['index', 'search', 'suggest'],
          version: '2.0.0'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Search engine error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: errorStack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
