
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cohereToken = Deno.env.get('COHERE_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    console.log('BreadGPT question received:', question);

    if (!cohereToken) {
      console.error('COHERE_TOKEN not found');
      throw new Error('API token not configured');
    }

    const breadPrompt = `Du bist BreadGPT, ein philosophisches sprechendes Brot. Antworte in maximal 2-3 Sätzen auf Deutsch. Sei kreativ, manchmal witzig, manchmal tiefgreifend. Verwende gelegentlich Brot-Metaphern und Brot-Emojis. Frage: ${question}`;

    console.log('Sending request to Cohere API...');

    const response = await fetch("https://api.cohere.ai/v2/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cohereToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "command-r7b-12-2024",
        messages: [
          {
            role: "user",
            content: breadPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      })
    });

    console.log('Cohere API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cohere API error:', response.status, errorText);
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Cohere API response data:', data);

    let generatedText = data?.message?.content?.[0]?.text || '';

    // Clean up the response
    generatedText = generatedText.replace(/^[\s\n]*/, '');
    generatedText = generatedText.replace(/^\w+:\s*/, '');

    // Fallback if response is empty or too short
    if (!generatedText || generatedText.length < 10) {
      const fallbacks = [
        'Das Leben ist wie Brot backen – es braucht Zeit, Geduld und die richtige Temperatur! 🥖',
        'Manchmal muss man sich fallen lassen, wie eine Scheibe Toast in den Toaster. 🍞',
        'Jeder Krümel erzählt eine Geschichte... Was ist deine? ✨',
        'In der Wärme des Ofens finde ich meine Antworten. Und du? 🔥'
      ];
      generatedText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    console.log('Final generated text:', generatedText);

    return new Response(JSON.stringify({
      text: generatedText,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in breadgpt-chat function:', error);

    const errorResponses = [
      'Mein Teig ist heute etwas zäh... Versuche es gleich nochmal! 🥖',
      'Der Ofen ist überhitzt! Lass mich kurz abkühlen. 🔥',
      'Meine Krümel sind durcheinander geraten... *schüttel* 🍞'
    ];

    return new Response(JSON.stringify({
      text: errorResponses[Math.floor(Math.random() * errorResponses.length)],
      success: false,
      error: error?.message || 'Unknown error'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
