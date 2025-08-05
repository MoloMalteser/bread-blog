import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  postId: string;
  title: string;
  author: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, title, author }: NotificationPayload = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all notification subscriptions except the post author
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!post) {
      throw new Error('Post not found');
    }

    const { data: subscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('subscription')
      .neq('user_id', post.author_id);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found');
      return new Response(
        JSON.stringify({ message: 'No subscriptions to send to' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare notification payload
    const notificationPayload = {
      title: '🍞 Bread Blog',
      body: `${author} hat einen neuen Post veröffentlicht: "${title}"`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: `/post/${postId}`,
        postId,
        title,
        author
      }
    };

    console.log(`Sending notifications to ${subscriptions.length} subscribers`);

    // Send notifications to all subscribers
    const notificationPromises = subscriptions.map(async (sub) => {
      try {
        const subscription = sub.subscription;
        
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint,
            notification: notificationPayload,
            data: notificationPayload.data
          })
        });

        if (!response.ok) {
          console.error('FCM Error:', await response.text());
        } else {
          console.log('Notification sent successfully');
        }
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });

    await Promise.allSettled(notificationPromises);

    return new Response(
      JSON.stringify({ 
        message: `Notifications sent to ${subscriptions.length} subscribers`,
        postId,
        title 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-post-notification function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to send post notification'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});