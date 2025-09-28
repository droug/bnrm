import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ArchivingResult {
  archived_count: number;
  skipped_count: number;
  execution_time: string;
  details?: any[];
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting automatic content archiving process...');

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call the database function to perform automatic archiving
    const { data: result, error } = await supabase.rpc('perform_automatic_archiving');

    if (error) {
      console.error('Error during automatic archiving:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Archiving completed successfully:', result);

    // Log the archiving operation
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        action: 'automatic_archiving',
        resource_type: 'content',
        details: {
          archived_count: result.archived_count,
          skipped_count: result.skipped_count,
          execution_time: result.execution_time,
          trigger: 'scheduled'
        }
      });

    if (logError) {
      console.warn('Failed to log archiving activity:', logError);
    }

    const response: ArchivingResult = {
      archived_count: result.archived_count,
      skipped_count: result.skipped_count,
      execution_time: result.execution_time,
    };

    return new Response(
      JSON.stringify({
        success: true,
        ...response,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in archiving function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during archiving process',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});