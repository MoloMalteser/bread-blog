import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceToken = Deno.env.get('COHERE_TOKEN'); // COHERE_TOKEN statt HUGGINGFACE_TOKEN

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
      console.error('COHERE_TOKEN not found');
      throw new Error('API token not configured');
    }

    // Beispiel-Prompt (passt du ggf. an)
    const breadPrompt = `Du bist BreadGPT, ein philosophisches sprechendes Brot. Antworte in maximal 2-3 Sätzen auf Deutsch. Sei kreativ, manchmal witzig, manchmal tiefgreifend. Verwende gelegentlich Brot-Metaphern und Brot-Emojis. Frage: ${question}`;

    console.log('Sending request to Cohere API...');

    const response = await fetch("https://api.cohere.ai/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${huggingFaceToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "command-xlarge-nightly",
        prompt: breadPrompt,
        max_tokens: 150,
        temperature: 0.8,
        k: 0,
        p: 0.75,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: ["--"]
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

    let generatedText = data?.generations?.[0]?.text || '';

    // Clean up the response
    generatedText = generatedText.replace(breadPrompt, '').trim();
    generatedText = generatedText.replace(/^[\s\n]*/, ''); // führende Leerzeichen entfernen
    generatedText = generatedText.replace(/^\w+:\s*/, ''); // Assistant: etc. entfernen

    // Fallback falls Antwort leer oder zu kurz ist
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

    const errorText = error?.message || String(error) || 'Unbekannter Fehler';

    return new Response(JSON.stringify({
      text: errorResponses[Math.floor(Math.random() * errorResponses.length)],
      success: false,
      error: errorText
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
