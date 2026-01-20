import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting activity logs cleanup process...')

    // Call the cleanup function
    const { data, error } = await supabaseClient.rpc('cleanup_old_activity_logs')

    if (error) {
      console.error('Error during cleanup:', error)
      throw error
    }

    const deletedCount = data || 0
    console.log(`Successfully cleaned up ${deletedCount} old activity logs`)

    // Log the cleanup activity
    if (deletedCount > 0) {
      await supabaseClient.from('activity_logs').insert({
        user_id: null, // System action
        action: 'cleanup_old_logs',
        resource_type: 'system',
        resource_id: null,
        details: {
          deleted_count: deletedCount,
          retention_days: 90,
          cleanup_timestamp: new Date().toISOString()
        },
        ip_address: null,
        user_agent: 'system/cleanup-function'
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup completed successfully`,
        deleted_count: deletedCount,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in cleanup function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})