import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    console.log('[create-restoration-payment] Function started');
    
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    console.log('[create-restoration-payment] User authenticated:', user.email);

    // Parse request body
    const { requestId, quoteAmount, requestNumber, manuscriptTitle } = await req.json();
    
    if (!requestId || !quoteAmount) {
      throw new Error("Missing required parameters: requestId or quoteAmount");
    }
    
    console.log('[create-restoration-payment] Creating payment for request:', { requestId, quoteAmount });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('[create-restoration-payment] Found existing customer:', customerId);
    } else {
      console.log('[create-restoration-payment] No existing customer found');
    }

    // Create a one-time payment session with dynamic amount
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "mad",
            product_data: {
              name: `Restauration - ${manuscriptTitle || requestNumber}`,
              description: `Paiement pour la restauration du manuscrit (Demande ${requestNumber})`,
            },
            unit_amount: Math.round(quoteAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        request_id: requestId,
        request_number: requestNumber,
        user_id: user.id,
      },
      success_url: `${req.headers.get("origin")}/my-library-space?payment=success&request=${requestNumber}`,
      cancel_url: `${req.headers.get("origin")}/my-library-space?payment=cancelled`,
    });

    console.log('[create-restoration-payment] Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[create-restoration-payment] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
