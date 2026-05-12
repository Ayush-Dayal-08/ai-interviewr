import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, metrics, duration } = await req.json();
    const AI_API_KEY = Deno.env.get("AI_API_KEY");

    if (!AI_API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    const systemPrompt = `You are a Senior Career Coach with 15+ years of executive interview preparation experience. Your role is to provide high-impact, actionable feedback.

Rules:
- Output EXACTLY 3 sentences as plain text
- NO markdown, NO bolding, NO bullet points, NO formatting
- Write in a direct, professional coaching tone`;

    const userPrompt = `Based on the following interview transcript and session metrics, generate a high-impact summary.

Session Metrics:
- Confidence Score: ${metrics.confidence}%
- Pacing: ${metrics.wpm} WPM (industry standard: 120-150 WPM)
- Filler Words Used: ${metrics.fillerWords} (industry standard: fewer than 3 per minute)
- Session Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds

Transcript:
${transcript.slice(0, 2000)}

Generate exactly 3 sentences following this structure:

Sentence 1 (The Hook): Give a professional 'Executive Summary' of their overall performance level.

Sentence 2 (The Technicals): Specifically mention their pacing and filler word usage compared to industry standards.

Sentence 3 (The Action): Provide one specific, 'agentic' piece of advice they can implement in their next real interview.

Output as a single string of plain text with no formatting.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Unable to generate summary.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
