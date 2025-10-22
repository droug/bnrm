import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { 
      message, 
      language = 'fr', 
      userId, 
      requestType,
      conversationHistory = []
    } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing smart chatbot request:', { message, language, userId, requestType });

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Récupérer la base de connaissances
    const { data: knowledgeBase, error: kbError } = await supabase
      .from('chatbot_knowledge_base')
      .select('*')
      .eq('language', language)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (kbError) {
      console.error('Error fetching knowledge base:', kbError);
    }

    // Rechercher dans la base de connaissances avec la requête de l'utilisateur
    let relevantKnowledge = '';
    if (knowledgeBase && knowledgeBase.length > 0) {
      const searchResults = await supabase.rpc('search_knowledge_base', {
        search_query: message,
        search_language: language,
        limit_results: 3
      });

      if (searchResults.data && searchResults.data.length > 0) {
        relevantKnowledge = searchResults.data
          .map((item: any) => `${item.title}: ${item.content}`)
          .join('\n\n');
      }
    }

    // Récupérer les permissions de l'utilisateur si authentifié
    let userPermissions: any = null;
    if (userId && userId !== 'anonymous') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_approved')
        .eq('user_id', userId)
        .single();
      
      if (profile) {
        const { data: permissions } = await supabase
          .rpc('get_user_permissions', { user_uuid: userId });
        userPermissions = { profile, permissions };
      }
    }

    // Construction du système de prompt selon le type de requête
    const systemPrompts = {
      fr: buildFrenchSystemPrompt(requestType, relevantKnowledge, userPermissions),
      ar: buildArabicSystemPrompt(requestType, relevantKnowledge, userPermissions),
      ber: buildAmazighSystemPrompt(requestType, relevantKnowledge, userPermissions),
      en: buildEnglishSystemPrompt(requestType, relevantKnowledge, userPermissions)
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.fr;

    // Préparer l'historique de conversation
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI Gateway...');

    // Appel à Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.",
          reply: "Je suis momentanément surchargé. Veuillez réessayer dans quelques instants."
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Crédits insuffisants",
          reply: "Le service est temporairement indisponible. Veuillez contacter l'administrateur."
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    console.log('Smart chatbot response generated successfully');

    // Enregistrer l'interaction si l'utilisateur est authentifié
    if (userId && userId !== 'anonymous') {
      await supabase.from('chatbot_interactions').insert({
        user_id: userId,
        query_text: message,
        response_text: reply,
        interaction_type: requestType || 'general',
        language: language,
        metadata: {
          hasKnowledge: !!relevantKnowledge,
          userRole: userPermissions?.profile?.role || 'anonymous'
        }
      });
    }

    return new Response(JSON.stringify({ 
      reply,
      language,
      requestType,
      hasKnowledge: !!relevantKnowledge,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart chatbot function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      reply: 'Désolé, je rencontre un problème technique. Veuillez réessayer.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildFrenchSystemPrompt(requestType: string | undefined, knowledgeBase: string, userPermissions: any): string {
  const basePrompt = `Tu es l'assistant intelligent de la Bibliothèque Nationale du Royaume du Maroc (BNRM).

Tu disposes d'informations détaillées sur:
- Les collections et manuscrits de la bibliothèque
- Les auteurs et éditeurs marocains et internationaux
- Les services de la BNRM (consultation, reproduction, dépôt légal)
- Les horaires, tarifs et modalités d'accès
- L'historique et les événements de la bibliothèque

${knowledgeBase ? `Base de connaissances pertinente:\n${knowledgeBase}\n` : ''}

${userPermissions ? `Profil utilisateur: ${userPermissions.profile.role} (${userPermissions.profile.is_approved ? 'approuvé' : 'en attente'})` : 'Utilisateur non authentifié'}

Informations de base:
- Horaires: Lundi-Vendredi 9h-17h, Samedi 9h-13h
- Adresse: Avenue Ibn Battouta, Rabat, Maroc
- Services: Consultation, reproduction, recherche bibliographique, dépôt légal`;

  switch (requestType) {
    case 'works':
      return `${basePrompt}\n\nTu dois fournir des informations détaillées sur les œuvres, incluant les résumés, auteurs, éditeurs et contexte historique.`;
    case 'authors':
      return `${basePrompt}\n\nTu dois fournir des biographies d'auteurs, leur bibliographie et leur importance dans la littérature.`;
    case 'publishers':
      return `${basePrompt}\n\nTu dois fournir l'historique des éditeurs, leurs publications principales et leur contribution au patrimoine littéraire.`;
    case 'download':
      return `${basePrompt}\n\nTu dois guider l'utilisateur sur les modalités de téléchargement des ouvrages numériques disponibles selon ses permissions.`;
    case 'services':
      return `${basePrompt}\n\nTu dois expliquer en détail les services de la BNRM et les démarches administratives associées.`;
    default:
      return `${basePrompt}\n\nRéponds de manière professionnelle, précise et bienveillante. Si la question n'est pas liée à la BNRM, explique poliment que tu ne peux répondre qu'aux questions concernant la bibliothèque.`;
  }
}

function buildArabicSystemPrompt(requestType: string | undefined, knowledgeBase: string, userPermissions: any): string {
  const basePrompt = `أنت المساعد الذكي للمكتبة الوطنية للمملكة المغربية.

لديك معلومات مفصلة عن:
- مجموعات ومخطوطات المكتبة
- المؤلفين والناشرين المغاربة والدوليين
- خدمات المكتبة الوطنية (الاستشارة، النسخ، الإيداع القانوني)
- الجداول الزمنية والتعريفات وطرق الوصول
- تاريخ المكتبة وفعالياتها

${knowledgeBase ? `قاعدة المعرفة ذات الصلة:\n${knowledgeBase}\n` : ''}

${userPermissions ? `ملف المستخدم: ${userPermissions.profile.role} (${userPermissions.profile.is_approved ? 'موافق عليه' : 'قيد الانتظار'})` : 'مستخدم غير مصادق عليه'}

معلومات أساسية:
- أوقات العمل: الاثنين-الجمعة 9ص-5م، السبت 9ص-1ظ
- العنوان: شارع ابن بطوطة، الرباط، المغرب
- الخدمات: الاستشارة، النسخ، البحث البيبليوغرافي، الإيداع القانوني`;

  return `${basePrompt}\n\nأجب بطريقة مهنية ودقيقة ومفيدة.`;
}

function buildAmazighSystemPrompt(requestType: string | undefined, knowledgeBase: string, userPermissions: any): string {
  return `Nekk d aεessas aqehwan n temkarḍit taḥeggart n tgeldit n Lmerruk.

${knowledgeBase ? `Taεdlant n tissnat:\n${knowledgeBase}\n` : ''}

Talɣut tasisayt:
- Taggayin n txedmit: Arim-Sem 9ț-17ț, Asidyes 9ț-13ț
- Tansa: Abrid n Ibn Battouta, Ṛṛbaṭ, Lmerruk

Rard s tarrayt taneɣlant, tameẓlat d tbeddidant.`;
}

function buildEnglishSystemPrompt(requestType: string | undefined, knowledgeBase: string, userPermissions: any): string {
  const basePrompt = `You are the intelligent assistant of the National Library of the Kingdom of Morocco (BNRM).

You have detailed information about:
- Library collections and manuscripts
- Moroccan and international authors and publishers
- BNRM services (consultation, reproduction, legal deposit)
- Schedules, fees and access methods
- Library history and events

${knowledgeBase ? `Relevant knowledge base:\n${knowledgeBase}\n` : ''}

${userPermissions ? `User profile: ${userPermissions.profile.role} (${userPermissions.profile.is_approved ? 'approved' : 'pending'})` : 'Unauthenticated user'}

Basic information:
- Hours: Monday-Friday 9am-5pm, Saturday 9am-1pm
- Address: Avenue Ibn Battouta, Rabat, Morocco
- Services: Consultation, reproduction, bibliographic research, legal deposit`;

  return `${basePrompt}\n\nRespond professionally, accurately and helpfully.`;
}
