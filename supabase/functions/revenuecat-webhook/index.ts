import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface RevenueCatEvent {
  api_version: string;
  event: {
    type: string;
    app_user_id: string;
    aliases: string[];
    original_app_user_id: string;
    id: string;
    event_timestamp_ms: number;
    entitlements: {
      [key: string]: {
        expires_date: string | null;
        purchase_date: string;
        product_identifier: string;
      };
    };
    subscriber_attributes: {
      [key: string]: {
        value: string;
        updated_at_ms: number;
      };
    };
  };
}

serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse webhook payload
    const payload: RevenueCatEvent = await req.json();
    const { event } = payload;

    console.log(`📥 RevenueCat webhook: ${event.type} for user ${event.app_user_id}`);

    // Extract user ID (remove 'rc_anonymous_' prefix if present)
    let userId = event.app_user_id;
    if (userId.startsWith('rc_anonymous_')) {
      // For anonymous users, we'll use their ID as-is
      // In production, you'd want to handle the migration when they sign up
      console.log('⚠️ Anonymous user purchase:', userId);
    }

    // Check if user has active "pro" entitlement
    const isPro = event.entitlements?.pro !== undefined;
    const proExpiry = event.entitlements?.pro?.expires_date || null;

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update or create user profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          is_pro: isPro,
          pro_expires_at: proExpiry,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating user profile:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Updated user ${userId}: isPro=${isPro}, expires=${proExpiry}`);

    // Log event for analytics
    const eventLog = {
      user_id: userId,
      event_type: event.type,
      is_pro: isPro,
      product_id: event.entitlements?.pro?.product_identifier || null,
      timestamp: new Date(event.event_timestamp_ms).toISOString(),
    };

    await supabase.from('subscription_events').insert(eventLog).select();

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated user ${userId}`,
        data: {
          userId,
          isPro,
          expiresAt: proExpiry,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
