
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceToken = Deno.env.get('HUGGINGFACE_TOKEN');

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

    if (!huggingFaceToken) {
      console.error('HUGGINGFACE_TOKEN not found');
      throw new Error('API token not configured');
    }

    // Create a bread-themed prompt
    const breadPrompt = `Du bist BreadGPT, ein philosophisches sprechendes Brot. Antworte in maximal 2-3 Sätzen auf Deutsch. Sei kreativ, manchmal witzig, manchmal tiefgreifend. Verwende gelegentlich Brot-Metaphern und Brot-Emojis. Frage: ${question}`;

    console.log('Sending request to Hugging Face API...');

    const response = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen1.5-4B-Chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${huggingFaceToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: breadPrompt,
        parameters: { 
          max_new_tokens: 150,
          temperature: 0.8,
          top_p: 0.9,
          return_full_text: false
        }
      })
    });

    console.log('Hugging Face response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hugging Face response data:', data);
    
    let generatedText = '';
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text.replace(breadPrompt, '').trim();
    } else if (data.generated_text) {
      generatedText = data.generated_text.replace(breadPrompt, '').trim();
    }

    console.log('Generated text before cleanup:', generatedText);

    // Clean up the response
    generatedText = generatedText.replace(/^[\s\n]*/, ''); // Remove leading whitespace
    generatedText = generatedText.replace(/^\w+:\s*/, ''); // Remove "Assistant:" or similar prefixes
    
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
    
    // Return a bread-themed error message
    const errorResponses = [
      'Mein Teig ist heute etwas zäh... Versuche es gleich nochmal! 🥖',
      'Der Ofen ist überhitzt! Lass mich kurz abkühlen. 🔥',
      'Meine Krümel sind durcheinander geraten... *schüttel* 🍞'
    ];
    
    return new Response(JSON.stringify({ 
      text: errorResponses[Math.floor(Math.random() * errorResponses.length)],
      success: false,
      error: error.message 
    }), {
      status: 200, // Return 200 so the frontend can handle it gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
