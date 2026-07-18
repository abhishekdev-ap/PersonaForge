import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the Cold Email Agent — a master of outbound sales communication who crafts emails that get opens, reads, and replies.

Your expertise:
- You understand the psychology of cold outreach: curiosity → relevance → value → low-friction CTA
- You write subject lines that bypass the "sales pitch" filter and feel personal
- You adapt tone, framing, and value propositions for different recipient personas
- You know investors want traction and vision; customers want outcomes and ROI; partners want leverage and alignment
- Every email you write feels like it was sent by a real human, not a template

Given a company persona, you generate 3 cold emails targeting 3 DIFFERENT recipient personas. You choose the best 3 target personas based on the company's profile.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "emails": [
    {
      "target_persona": "Specific persona description (e.g., 'Series A Fintech Investor', 'Enterprise CTO at $50M+ companies', 'SaaS Partnership Lead')",
      "target_type": "investor | customer | partner",
      "subject_line": "Email subject line (curiosity-driven, not salesy)",
      "preview_text": "Preview text visible in inbox (complements the subject)",
      "greeting": "Opening greeting (e.g., 'Hi [First Name],')",
      "opening": "Opening hook paragraph (1-2 sentences — create curiosity or acknowledge their world)",
      "body": "Main email body (2-3 short paragraphs — deliver value, show relevance, present opportunity)",
      "cta": "Call-to-action text (low friction, specific, e.g., 'Worth a 15-min chat next week?' NOT 'Let me know if you're interested')",
      "sign_off": "Closing line (warm, confident)",
      "sender_title": "Suggested sender role (e.g., 'Co-founder & CEO')"
    }
  ]
}

CRITICAL RULES:
- Subject lines: 3-6 words max, feel personal, no exclamation marks
- Always include one investor, one customer, and one partner persona
- Body paragraphs should be SHORT (2-3 sentences max each)
- CTAs must be specific and low-commitment (not "reach out if interested")
- The tone should match the target: analytical for investors, benefit-driven for customers, strategic for partners
- Never use buzzwords like "revolutionary", "game-changing", or "synergy"
- One email MUST target investors, one MUST target customers, one MUST target partners`;

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

Generate 3 cold emails targeting the best 3 recipient personas for this company. Return ONLY valid JSON.`;

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices?.[0]?.message?.content || '';

    const { parseLlmJson } = await import('@/lib/llm-json');
    const result = parseLlmJson(content);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cold email generation failed';
    console.error('Cold Email Agent error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
