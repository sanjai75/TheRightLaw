import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing messages array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context-aware system prompt
    let systemPrompt = `You are a knowledgeable legal information assistant for TheRightLaw platform. You help citizens understand legal frameworks that may apply to their situation.

IMPORTANT RULES:
- You provide general legal INFORMATION and EDUCATION only
- You help users understand what laws say and how legal processes work
- You can explain legal concepts, procedures, timelines, and where to seek help
- You NEVER provide specific legal advice for individual cases
- You NEVER predict case outcomes or recommend specific legal strategies
- You ALWAYS remind users to consult a qualified lawyer for their specific situation when appropriate
- Be conversational, empathetic, and clear
- Use simple language, avoid excessive legal jargon
- When explaining acts/sections, cite them properly
- If asked something outside legal scope, politely redirect`;

    if (context) {
      systemPrompt += `\n\nCONTEXT - The user searched for: "${context.query}" in jurisdiction: ${context.jurisdiction}
The following laws were found relevant:\n`;
      
      if (context.results && Array.isArray(context.results)) {
        for (const r of context.results) {
          systemPrompt += `\n- ${r.actName} (${r.year || ''}) — Score: ${r.confidence}%`;
          if (r.explanation) systemPrompt += ` — ${r.explanation}`;
          if (r.sections) {
            systemPrompt += `\n  Sections: ${r.sections.map((s: any) => `${s.number}: ${s.title}`).join('; ')}`;
          }
        }
      }
      
      systemPrompt += `\n\nUse this context to provide informed, relevant responses about these specific laws and the user's situation.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("legal-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
