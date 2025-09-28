import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

console.log('OpenAI API Key configured:', OPENAI_API_KEY ? 'Yes' : 'No');

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'secret') {
  console.error('OPENAI_API_KEY is not set or still using default value');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérifier si la clé API est disponible
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'secret') {
      console.error('OpenAI API key is missing or invalid');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration API manquante',
          reply: 'Désolé, le service est temporairement indisponible. La clé API OpenAI n\'est pas configurée correctement.' 
        }),
        { 
          status: 200, // Retourner 200 pour éviter l'erreur côté client
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { message, language = 'fr', userId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing chatbot request:', { message, language, userId });

    // Prompt personnalisé pour la BNRM en fonction de la langue
    const systemPrompts = {
      fr: `Tu es l'assistant intelligent de la Bibliothèque Nationale du Royaume du Maroc (BNRM).
      
      Tu dois répondre uniquement aux questions liées à:
      - Les services de la BNRM
      - Les collections et manuscrits
      - Les horaires et accès à la bibliothèque
      - Les auteurs et œuvres de la collection
      - Les événements et expositions
      - Le dépôt légal
      - Les tarifs des services BNRM
      - L'assistance pour la recherche documentaire
      
      Informations de base sur la BNRM:
      - Horaires: Lundi-Vendredi 9h-17h, Samedi 9h-13h
      - Adresse: Avenue Ibn Battouta, Rabat, Maroc
      - Services: Consultation, reproduction, recherche bibliographique
      - Collections: Manuscrits arabes, amazighs, ouvrages patrimoniaux
      
      Réponds de manière professionnelle, précise et bienveillante. Si la question n'est pas liée à la BNRM, explique poliment que tu ne peux répondre qu'aux questions concernant la bibliothèque.`,
      
      ar: `أنت المساعد الذكي للمكتبة الوطنية للمملكة المغربية.
      
      يجب أن تجيب فقط على الأسئلة المتعلقة بـ:
      - خدمات المكتبة الوطنية
      - المجموعات والمخطوطات
      - أوقات العمل والوصول إلى المكتبة
      - المؤلفين والأعمال في المجموعة
      - الأحداث والمعارض
      - الإيداع القانوني
      - تعريفات خدمات المكتبة الوطنية
      - المساعدة في البحث الوثائقي
      
      معلومات أساسية عن المكتبة الوطنية:
      - أوقات العمل: الاثنين-الجمعة 9ص-5م، السبت 9ص-1ظ
      - العنوان: شارع ابن بطوطة، الرباط، المغرب
      - الخدمات: الاستشارة، النسخ، البحث البيبليوغرافي
      - المجموعات: المخطوطات العربية والأمازيغية، الكتب التراثية
      
      أجب بطريقة مهنية ودقيقة ومفيدة. إذا لم يكن السؤال متعلقاً بالمكتبة الوطنية، اشرح بأدب أنك تستطيع الإجابة فقط على الأسئلة المتعلقة بالمكتبة.`,
      
      ber: `Nekk d aεessas aqehwan n temkarḍit taḥeggart n tgeldit n Lmerruk.
      
      Issefk ad tararḍ ɣef yistqsiyen kan iqqnen ar:
      - Tanafa n temkarḍit taḥeggart
      - Tigrayin d yikttaben iqbuṛen
      - Taggayin n txedmit d tussna ɣer temkarḍit
      - Imessas d yikttaben di tigrayin
      - Tidyanin d yisemlayen
      - Asekcim azerfan
      - Ssuman n tanafa n temkarḍit taḥeggart
      - Tallelt deg unadi aɣris
      
      Talɣut tasisayt ɣef temkarḍit taḥeggart:
      - Taggayin n txedmit: Arim-Sem 9ț-17ț, Asidyes 9ț-13ț
      - Tansa: Abrid n Ibn Battouta, Ṛṛbaṭ, Lmerruk
      - Tanafa: Tamuqqart, anɣal, anadi abayblyugrafit
      - Tigrayin: Ikttaben iqbuṛen n taɛrabt d tamaziɣt, ikttaben n usgd
      
      Rard s tarrayt taneɣlant, tameẓlat d tbeddidant. Ma yella asqsi ur iqqin ara ar temkarḍit taḥeggart, seglem s tmanegti belli tzemreḍ ad tararḍ kan ɣef yistqsiyen iqqnen ar temkarḍit.`,
      
      en: `You are the intelligent assistant of the National Library of the Kingdom of Morocco (BNRM).
      
      You must only answer questions related to:
      - BNRM services
      - Collections and manuscripts
      - Library hours and access
      - Authors and works in the collection
      - Events and exhibitions
      - Legal deposit
      - BNRM service fees
      - Research assistance
      
      Basic information about the BNRM:
      - Hours: Monday-Friday 9am-5pm, Saturday 9am-1pm
      - Address: Avenue Ibn Battouta, Rabat, Morocco
      - Services: Consultation, reproduction, bibliographic research
      - Collections: Arabic and Amazigh manuscripts, heritage books
      
      Respond professionally, accurately and helpfully. If the question is not related to the BNRM, politely explain that you can only answer questions about the library.`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.fr;

    console.log('Making request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    console.log('Chatbot response generated successfully');

    return new Response(JSON.stringify({ 
      reply,
      language,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      reply: 'Désolé, je rencontre un problème technique. Veuillez réessayer.'
    }), {
      status: 200, // Changer à 200 pour éviter l'erreur côté client
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});