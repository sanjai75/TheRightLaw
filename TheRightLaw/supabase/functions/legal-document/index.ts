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
    const { query, jurisdiction, documentType, results, language } = await req.json();

    if (!query || !jurisdiction || !documentType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
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

    const jurisdictionName = jurisdiction === 'IN' ? 'India' : jurisdiction === 'US' ? 'United States' : 'United Kingdom';

    const docTypeLabels: Record<string, string> = {
      fir: "First Information Report (FIR) to Police Station",
      complaint: "Formal Complaint Letter",
      consumer_complaint: "Consumer Complaint to District Consumer Forum",
      legal_notice: "Legal Notice",
      grievance: "Grievance Application / RTI Request",
      cyber_complaint: "Cyber Crime Complaint",
    };

    const docLabel = docTypeLabels[documentType] || "Legal Document";

    let resultsContext = "";
    if (results && Array.isArray(results)) {
      resultsContext = results.map((r: any) =>
        `- ${r.actName} (${r.year || ''}) — Sections: ${r.sections?.map((s: any) => `${s.number}: ${s.title}`).join('; ') || 'N/A'} — Relevance: ${r.confidence}%`
      ).join('\n');
    }

    const systemPrompt = `You are an expert legal document drafter for ${jurisdictionName}. You create professional, ready-to-use draft legal documents based on a citizen's real-world problem.

CRITICAL RULES:
- This is a TEMPLATE/DRAFT, clearly marked as such
- Include "[YOUR NAME]", "[YOUR ADDRESS]", "[DATE]", "[POLICE STATION NAME]" etc. as fillable placeholders
- Cite specific law sections from the matched laws provided
- Use formal but clear language that any citizen can understand
- Include all necessary formal elements (heading, subject line, body, prayer/request, signature block)
- Add a "NEXT STEPS" section at the end with practical instructions on where to submit, what to attach, and any deadlines
- ${language === 'hi' ? 'Write the document primarily in Hindi (Devanagari script) with English legal terms where standard' : 'Write in English'}
- Add a small disclaimer at the bottom: "This is an AI-generated draft for informational purposes only. Please review with a qualified legal professional before submission."`;

    const userPrompt = `Generate a "${docLabel}" draft document.

User's situation: "${query}"
Jurisdiction: ${jurisdictionName}

Applicable laws found:
${resultsContext || 'No specific laws provided — use your knowledge of applicable laws.'}

Create a complete, professional draft that the user can fill in their details and submit. Make it practical and actionable.`;

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
    console.error("legal-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
