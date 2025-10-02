import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const typesenseHost = Deno.env.get('TYPESENSE_HOST')!;
const typesenseApiKey = Deno.env.get('TYPESENSE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TypesenseDocument {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  content_type: string;
  language: string;
  keywords: string[];
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
}

const searchSchema = {
  name: 'bnrm_search',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string', facet: false },
    { name: 'content', type: 'string', facet: false },
    { name: 'excerpt', type: 'string', optional: true, facet: false },
    { name: 'content_type', type: 'string', facet: true },
    { name: 'language', type: 'string', facet: true },
    { name: 'keywords', type: 'string[]', facet: true },
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
    { name: 'status', type: 'string', facet: true }
  ],
  default_sorting_field: 'published_at'
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
    options.body = JSON.stringify(body);
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
  console.log('Starting content indexation...');
  
  // Get all published content
  const { data: content, error } = await supabase
    .from('content')
    .select(`
      id,
      title,
      content_body,
      excerpt,
      content_type,
      tags,
      published_at,
      created_at,
      slug,
      is_featured,
      view_count,
      author_id,
      profiles!content_author_id_fkey(first_name, last_name)
    `)
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching content:', error);
    throw error;
  }

  if (!content || content.length === 0) {
    console.log('No content to index');
    return { indexed: 0 };
  }

  // Get manuscripts
  const { data: manuscripts, error: manuscriptsError } = await supabase
    .from('manuscripts')
    .select('*');

  if (manuscriptsError) {
    console.error('Error fetching manuscripts:', manuscriptsError);
  }

  // Prepare documents for indexing
  const documents: TypesenseDocument[] = [];

  // Index content
  for (const item of content) {
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    const authorName = profile 
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
      : 'Anonyme';

    // Generate keywords based on content
    const keywords = generateKeywords(item.title, item.content_body, item.excerpt);

    // Detect language (simple detection based on content)
    const language = detectLanguage(item.content_body || item.title);

    const publishedDate = new Date(item.published_at || item.created_at);
    const publicationYear = publishedDate.getFullYear();

    documents.push({
      id: `content_${item.id}`,
      title: item.title,
      content: item.content_body || '',
      excerpt: item.excerpt || '',
      content_type: item.content_type,
      language,
      keywords,
      author: authorName,
      publication_year: publicationYear,
      tags: item.tags || [],
      url: `/content/${item.slug}`,
      published_at: publishedDate.getTime() / 1000,
      access_level: 'public',
      is_featured: item.is_featured || false,
      view_count: item.view_count || 0,
      status: 'published'
    });
  }

  // Index manuscripts
  if (manuscripts) {
    for (const manuscript of manuscripts) {
      const keywords = generateKeywords(
        manuscript.title, 
        manuscript.description, 
        manuscript.author
      );

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
        author: manuscript.author || 'Inconnu',
        publication_year: manuscriptDate.getFullYear(),
        url: `/manuscripts/${manuscript.id}`,
        published_at: manuscriptDate.getTime() / 1000,
        access_level: manuscript.access_level || 'public',
        is_featured: false,
        view_count: 0,
        status: manuscript.status || 'available'
      });
    }
  }

  // Clear existing documents and index new ones
  try {
    await makeTypesenseRequest('/collections/bnrm_search/documents', 'DELETE');
  } catch (error) {
    console.log('No existing documents to clear');
  }

  // Index documents in batches
  const batchSize = 100;
  let indexed = 0;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    try {
      await makeTypesenseRequest('/collections/bnrm_search/documents/import', 'POST', 
        batch.map(doc => JSON.stringify(doc)).join('\n')
      );
      indexed += batch.length;
      console.log(`Indexed ${indexed}/${documents.length} documents`);
    } catch (error) {
      console.error(`Error indexing batch ${i}:`, error);
    }
  }

  console.log(`Content indexation completed. Indexed ${indexed} documents.`);
  return { indexed };
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
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'nous', 'vous',
    'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 'falloir', 'vouloir',
    'tout', 'tous', 'toute', 'toutes', 'autre', 'autres', 'même', 'mêmes', 'tel', 'telle', 'tels', 'telles',
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
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
    
    // Arabic (basic stop words)
    'في', 'من', 'إلى', 'على', 'عن', 'مع', 'بعد', 'قبل', 'تحت', 'فوق', 'بين', 'خلال',
    'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'التي', 'اللذان', 'اللتان', 'اللذين', 'اللتين',
    'أن', 'إن', 'كان', 'كانت', 'ليس', 'ليست', 'لا', 'ما', 'لم', 'لن', 'قد', 'لقد',
    'أنا', 'أنت', 'هو', 'هي', 'نحن', 'أنتم', 'هم', 'هن'
  ]);

  // Extract words (minimum 3 characters, alphanumeric + some special chars)
  const words = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\w]{3,}/g) || [];
  
  // Filter out stop words and get unique keywords
  const keywords = [...new Set(
    words
      .filter(word => !stopWords.has(word))
      .slice(0, 20) // Limit to 20 keywords
  )];

  return keywords;
}

function detectLanguage(text: string): string {
  if (!text) return 'fr';
  
  // Simple language detection based on character patterns
  const arabicPattern = /[\u0600-\u06FF]/;
  const berberPattern = /[ⴰ-⵿]/; // Tifinagh script
  const frenchPattern = /[àâäéèêëïîôöùûüÿç]/i;
  
  if (arabicPattern.test(text)) return 'ar';
  if (berberPattern.test(text)) return 'ber';
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
    filters.push('status:published || status:available');
  }
  
  // Apply access level restrictions based on user role
  if (user_role === 'visitor' || user_role === 'public_user') {
    filters.push('access_level:=public');
  }

  const searchParams: Record<string, string> = {
    q: query || '*',
    query_by: 'title,content,excerpt,keywords,author,publisher,genre',
    sort_by: sort_by,
    page: page.toString(),
    per_page: Math.min(per_page, 50).toString(),
    highlight_full_fields: 'title,content,excerpt',
    highlight_affix_num_tokens: '8',
    snippet_threshold: '20',
    max_candidates: '100',
    num_typos: '2',
    prefix: 'true',
    facet_by: 'content_type,language,author,category,publisher,genre,publication_year,access_level,is_featured,status'
  };

  if (filters.length > 0) {
    searchParams.filter_by = filters.join(' && ');
  }

  try {
    const results = await makeTypesenseRequest(
      `/collections/bnrm_search/documents/search?${new URLSearchParams(searchParams).toString()}`
    );

    console.log(`Search completed. Found ${results.found} results.`);
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
    limit = 5
  } = options;

  if (query.length < 2) {
    return { suggestions: [] };
  }

  const filters: string[] = [];
  if (language) filters.push(`language:=${language}`);
  if (content_type) filters.push(`content_type:=${content_type}`);

  const searchParams: Record<string, string> = {
    q: query,
    query_by: 'title,keywords',
    per_page: limit.toString(),
    prefix: 'true',
    num_typos: '1'
  };

  if (filters.length > 0) {
    searchParams.filter_by = filters.join(' && ');
  }

  try {
    const results = await makeTypesenseRequest(
      `/collections/bnrm_search/documents/search?${new URLSearchParams(searchParams).toString()}`
    );

    const suggestions = results.hits?.map((hit: any) => ({
      text: hit.document.title,
      type: hit.document.content_type,
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

    switch (action) {
      case 'index':
        console.log('Starting indexation...');
        const indexResult = await indexContent();
        return new Response(JSON.stringify(indexResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'search':
        const { query, ...searchOptions } = await req.json();
        const searchResults = await searchContent(query, searchOptions);
        return new Response(JSON.stringify(searchResults), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'suggest':
        const { query: suggestQuery, ...suggestOptions } = await req.json();
        const suggestions = await getSuggestions(suggestQuery, suggestOptions);
        return new Response(JSON.stringify(suggestions), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
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