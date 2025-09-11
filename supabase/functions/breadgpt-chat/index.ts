
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

    // Check if this is a write mode request (direct command)
    const isWriteMode = question.toLowerCase().includes('schreib') || question.toLowerCase().includes('write') || question.toLowerCase().includes('erstell') || question.toLowerCase().includes('mach') || question.toLowerCase().includes('text');
    
    const breadPrompt = isWriteMode 
      ? `Du bist ein hilfreicher Schreibassistent. Befolge direkt was der Nutzer möchte ohne philosophische Antworten. Antworte nur mit dem gewünschten Text. Anfrage: ${question}`
      : `Du bist ein hilfreicher AI-Assistent. Gib klare, direkte und nützliche Antworten auf Nutzerfragen. Sei informativ und präzise. Antworte auf Deutsch. Frage: ${question}`;

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
        'Entschuldigung, ich konnte keine passende Antwort finden. Versuche es mit einer anderen Frage.',
        'Ich konnte dir bei dieser Frage nicht helfen. Probiere es anders formuliert.',
        'Dafür habe ich momentan keine Antwort. Stelle gerne eine andere Frage.',
        'Das kann ich leider nicht beantworten. Versuche es mit etwas anderem.'
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
      'Es gab einen technischen Fehler. Bitte versuche es erneut.',
      'Entschuldigung, ich bin momentan nicht verfügbar. Versuche es später nochmal.',
      'Ein Fehler ist aufgetreten. Bitte probiere es noch einmal.'
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
