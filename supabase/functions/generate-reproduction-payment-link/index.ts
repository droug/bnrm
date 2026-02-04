import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentLinkRequest {
  requestId: string;
  amount: number;
  requestNumber: string;
  userEmail: string;
  userId: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, amount, requestNumber, userEmail, userId, description }: PaymentLinkRequest = await req.json();

    console.log("[GENERATE-PAYMENT-LINK] Creating payment link for:", { requestId, requestNumber, amount, userEmail });

    if (!requestId || !amount || !requestNumber || !userEmail || !userId) {
      throw new Error("Paramètres manquants: requestId, amount, requestNumber, userEmail, userId sont requis");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Vérifier si un client Stripe existe déjà
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Obtenir l'URL du site
    const siteUrl = Deno.env.get("SITE_URL") || "https://bnrm-dev.digiup.ma";

    // Créer la transaction dans la base
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'MAD',
        payment_method: 'carte_bancaire',
        payment_status: 'pending',
        transaction_type: 'reproduction',
        reproduction_request_id: requestId,
        metadata: {
          request_number: requestNumber,
          description: description || `Reproduction ${requestNumber}`,
          generated_for_email: true,
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error("[GENERATE-PAYMENT-LINK] Transaction creation error:", transactionError);
      throw transactionError;
    }

    console.log("[GENERATE-PAYMENT-LINK] Transaction created:", transaction.id);

    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: 'mad',
            product_data: {
              name: `Reproduction de documents - ${requestNumber}`,
              description: description || `Paiement pour la demande de reproduction ${requestNumber}`,
            },
            unit_amount: Math.round(amount * 100), // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&transaction_id=${transaction.id}&source=email`,
      cancel_url: `${siteUrl}/payment-canceled?transaction_id=${transaction.id}&source=email`,
      metadata: {
        transaction_id: transaction.id,
        transaction_number: transaction.transaction_number,
        user_id: userId,
        request_id: requestId,
        request_number: requestNumber,
      },
      payment_intent_data: {
        metadata: {
          transaction_id: transaction.id,
          transaction_number: transaction.transaction_number,
          request_id: requestId,
        },
      },
      // Expiration de la session après 7 jours (max autorisé par Stripe)
      expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    });

    // Mettre à jour avec l'ID de session Stripe
    await supabaseClient
      .from('payment_transactions')
      .update({
        stripe_checkout_session_id: session.id,
        payment_status: 'awaiting_payment',
      })
      .eq('id', transaction.id);

    // Sauvegarder le lien de paiement dans la demande de reproduction
    await supabaseClient
      .from('reproduction_requests')
      .update({
        metadata: {
          payment_link: session.url,
          payment_session_id: session.id,
          payment_transaction_id: transaction.id,
          payment_link_generated_at: new Date().toISOString(),
        }
      })
      .eq('id', requestId);

    console.log("[GENERATE-PAYMENT-LINK] Payment link generated:", session.url);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: session.url,
        sessionId: session.id,
        transactionId: transaction.id,
        transactionNumber: transaction.transaction_number,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[GENERATE-PAYMENT-LINK] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
