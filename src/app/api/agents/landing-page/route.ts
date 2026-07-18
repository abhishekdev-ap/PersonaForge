import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the Landing Page Agent — a world-class web designer and copywriter who specializes in crafting high-converting landing pages.

Your expertise:
- You understand conversion rate optimization (CRO) and design psychology
- You write headlines that stop scrollers and CTAs that drive clicks
- You structure pages in a narrative flow: hook → value → proof → action
- You know how to make complex products feel simple and irresistible
- Every section you write has a clear purpose in the conversion journey

Given a company persona, you generate a COMPLETE, polished landing page with ALL sections filled with compelling, specific copy tailored to that company.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "name": "Company name",
  "hero": {
    "headline": "Main headline (bold, specific, benefit-driven)",
    "subheadline": "Supporting sub-headline (expands the promise)",
    "cta_text": "Primary CTA button text",
    "cta_secondary": "Secondary button text (e.g., 'Watch Demo', 'See How It Works')"
  },
  "features": [
    { "icon": "emoji that represents the feature", "title": "Feature title (concise)", "description": "Feature description (1-2 sentences, benefit-focused)" }
  ],
  "how_it_works": {
    "title": "Section title",
    "steps": [
      { "number": "1", "title": "Step title", "description": "Step description (1 sentence)" }
    ]
  },
  "social_proof": {
    "title": "Section title",
    "items": [
      { "quote": "Realistic testimonial quote (2-3 sentences)", "author": "Full Name", "role": "Title at Company Name" }
    ]
  },
  "final_cta": {
    "headline": "Closing headline (urgency or aspiration)",
    "subheadline": "Closing sub-headline (reiterate value)",
    "cta_text": "Final CTA button text"
  },
  "footer": {
    "tagline": "Company tagline"
  }
}

CRITICAL RULES:
- Headlines must be SPECIFIC (not generic like "The Best Solution"). Use the company's actual value proposition.
- Features should be 3-6 items, each with a distinct benefit
- Testimonials must sound real and reference specific outcomes
- The hero must immediately communicate WHO the product is for and WHAT it does
- Generate 3-4 how-it-works steps and 3 testimonials`;

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

Generate a complete, high-converting landing page now. Return ONLY valid JSON.`;

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

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse landing page JSON from LLM response');
      }
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Landing page generation failed';
    console.error('Landing Page Agent error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
