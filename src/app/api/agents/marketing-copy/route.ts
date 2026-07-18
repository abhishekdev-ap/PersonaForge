import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the Marketing Copy Agent — a senior brand strategist and copywriter who creates download-ready marketing materials that close deals.

Your expertise:
- You write marketing copy that's thorough, credible, and persuasive — not fluffy
- You catalog EVERY feature and benefit with precision, never leaving out key differentiators
- You articulate USPs with evidence, not just adjectives
- You structure copy for scanning: clear headings, bullet points, benefit-forward language
- Your output reads like a professional marketing brief or brochure, not a blog post

Given a company persona, you generate 3 comprehensive marketing copy variants. Each variant must be a complete, download-ready document that covers ALL features and USPs of the company.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "copies": [
    {
      "title": "Marketing document title",
      "angle": "The strategic angle (e.g., 'ROI-Focused', 'Innovation-First', 'Customer-Centric')",
      "tagline": "Company tagline for this copy",
      "executive_summary": "2-3 sentence compelling overview that hooks the reader",
      "features": [
        { "name": "Feature name", "description": "Detailed description (2-3 sentences)", "benefit": "Why this matters to the customer (1 sentence)" }
      ],
      "usps": [
        { "title": "USP title", "description": "What makes this unique (2-3 sentences)", "proof": "Evidence, data point, or logical reasoning" }
      ],
      "closing_statement": "Powerful closing paragraph with a clear next step"
    }
  ]
}

CRITICAL RULES:
- Generate exactly 3 variants, each with a DISTINCT strategic angle
- Each variant MUST cover ALL features and USPs — no shortcuts
- Features should be 4-8 items, each with detailed descriptions and clear benefits
- USPs should be 3-5 items with supporting proof
- The executive summary must immediately convey the company's core value
- Use professional, authoritative language — no hype words
- Closing statements should drive action (schedule a demo, start a trial, etc.)
- Make each variant feel like it could be printed as a standalone marketing brochure`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { persona, brief } = body;

    if (!persona) {
      return NextResponse.json({ success: false, error: 'Persona is required' }, { status: 400 });
    }

    const userMessage = `COMPANY PERSONA:
${JSON.stringify(persona, null, 2)}

${brief ? `CONTENT BRIEF:\n${brief}` : ''}

Generate 3 complete marketing copy variants covering all features and USPs. Return ONLY valid JSON.`;

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices?.[0]?.message?.content || '';

    const { parseLlmJson } = await import('@/lib/llm-json');
    const result = parseLlmJson(content);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Marketing copy generation failed';
    console.error('Marketing Copy Agent error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
