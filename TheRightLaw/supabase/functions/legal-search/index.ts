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
    const { query, jurisdiction, acts } = await req.json();

    if (!query || !jurisdiction || !acts) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: query, jurisdiction, acts" }),
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

    // Build compact act catalog for the prompt
    const actCatalog = acts.map((a: any) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      year: a.year,
      sections: a.sections.map((s: any) => `${s.sectionNumber}: ${s.title}`).join("; "),
      keywords: a.keywords.slice(0, 10).join(", "),
    }));

    const systemPrompt = `You are an expert legal analyst specializing in ${jurisdiction === 'IN' ? 'Indian' : jurisdiction === 'US' ? 'United States' : 'United Kingdom'} law. 

Given a user's real-world problem described in plain language, score how relevant each law from the catalog is to their situation.

Rules:
- Score from 0 to 100 based on how directly applicable the law is
- 80-100: Directly applicable, the law specifically addresses this situation
- 50-79: Strongly related, covers key aspects of the situation  
- 20-49: Somewhat related, may apply in certain circumstances
- 0-19: Not relevant
- Provide a brief one-line explanation of WHY each law is relevant (or not)
- Consider the specific sections listed, not just the act name
- Think about what a practicing lawyer would advise`;

    const userPrompt = `User's problem: "${query}"

Available laws in ${jurisdiction}:
${JSON.stringify(actCatalog, null, 1)}

Score each law's relevance to the user's problem.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_laws",
              description: "Return relevance scores for each law in the catalog",
              parameters: {
                type: "object",
                properties: {
                  scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        actId: { type: "string", description: "The act ID" },
                        score: { type: "number", description: "Relevance score 0-100" },
                        explanation: { type: "string", description: "Brief one-line explanation of relevance" },
                      },
                      required: ["actId", "score", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["scores"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "score_laws" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error("AI gateway error:", status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable", fallback: true }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "AI returned unexpected format", fallback: true }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("legal-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
