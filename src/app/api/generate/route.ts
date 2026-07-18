import { NextRequest, NextResponse } from 'next/server';

const CONTENT_GENERATION_PROMPTS: Record<string, string> = {
  'landing-page': `You are an expert landing page designer and copywriter. Given the following persona (company profile), generate a complete, polished landing page.

The landing page must include ALL of these sections:
- Hero section with headline, subheadline, and CTA
- Features/What We Do section (3-6 features with icons and descriptions)
- How It Works section (3-4 steps)
- Social Proof section (testimonials or trust signals)
- CTA section (final call to action)

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "hero": {
    "headline": "Main headline",
    "subheadline": "Supporting sub-headline",
    "cta_text": "Button text",
    "cta_secondary": "Secondary button text or null"
  },
  "features": [
    { "icon": "emoji or icon name", "title": "Feature title", "description": "Feature description" }
  ],
  "how_it_works": {
    "title": "Section title",
    "steps": [
      { "number": "1", "title": "Step title", "description": "Step description" }
    ]
  },
  "social_proof": {
    "title": "Section title",
    "items": [
      { "quote": "Testimonial quote", "author": "Name", "role": "Title/Company" }
    ]
  },
  "final_cta": {
    "headline": "Closing headline",
    "subheadline": "Closing sub-headline",
    "cta_text": "Button text"
  },
  "footer": {
    "tagline": "Company tagline"
  }
}`,

  'cold-emails': `You are an expert cold email copywriter. Given the following company persona, generate 3 cold emails targeting DIFFERENT recipient personas.

For each email, choose a different target persona that makes strategic sense for this company (e.g., potential investor, potential customer, potential partner, etc.). The LLM should decide the best 3 target personas based on the company's profile.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "emails": [
    {
      "target_persona": "Who this email is targeting (e.g., Series A Investor, Enterprise CTO, Small Business Owner)",
      "target_type": "investor | customer | partner",
      "subject_line": "Email subject line",
      "preview_text": "Preview text visible next to subject",
      "greeting": "Opening greeting",
      "opening": "Opening hook paragraph (1-2 sentences)",
      "body": "Main email body (2-3 paragraphs, concise and compelling)",
      "cta": "Call-to-action text",
      "sign_off": "Closing line",
      "sender_title": "Suggested sender title/role"
    }
  ]
}`,

  'marketing-copy': `You are an expert marketing copywriter. Given the following company persona, generate 2 comprehensive marketing copy documents that highlight ALL features and unique selling propositions (USPs) of the company.

Each variant should take a different marketing angle but must thoroughly cover the company's features, benefits, and USPs. The copy should be suitable for a downloadable PDF or marketing brochure.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "copies": [
    {
      "title": "Marketing copy title/heading",
      "angle": "The marketing angle used",
      "tagline": "Company tagline for this copy",
      "executive_summary": "2-3 sentence compelling overview",
      "features": [
        { "name": "Feature name", "description": "Detailed description", "benefit": "Why this matters to the customer" }
      ],
      "usps": [
        { "title": "USP title", "description": "Why this is unique and valuable", "proof": "Evidence or reasoning" }
      ],
      "closing_statement": "Powerful closing paragraph"
    }
  ]
}`,

  'linkedin-post': `You are an expert LinkedIn content strategist. Given the following company persona, generate a compelling LinkedIn post that showcases the company, its mission, or a key offering.

The post should feel authentic, professional, and engaging — not overly salesy. It should be the kind of post that gets engagement from the company's target audience.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "post": {
    "author_name": "Suggested author name (e.g., CEO or Founder)",
    "author_role": "Role at the company",
    "author_headline": "LinkedIn headline",
    "content": "The full LinkedIn post text with line breaks for readability. Use hook → story → insight → CTA structure.",
    "hashtags": ["3-5 relevant hashtags"],
    "call_to_action": "What readers should do (comment, share, visit link, etc.)",
    "estimated_read_time": "X min read"
  }
}`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { persona, contentType, brief } = body;

    if (!persona || !contentType) {
      return NextResponse.json(
        { success: false, error: 'Persona and content type are required' },
        { status: 400 }
      );
    }

    const systemPrompt = CONTENT_GENERATION_PROMPTS[contentType];
    if (!systemPrompt) {
      return NextResponse.json(
        { success: false, error: `Invalid content type: ${contentType}` },
        { status: 400 }
      );
    }

    const userMessage = `PERSONA:
${JSON.stringify(persona, null, 2)}

${brief ? `CONTENT BRIEF:\n${brief}` : 'Generate the best possible content for this persona without a specific brief.'}

Generate the content now. Remember: return ONLY valid JSON.`;

    // Use z-ai-web-dev-sdk (no API key needed)
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
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
        throw new Error('Could not parse content JSON from LLM response');
      }
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Content generation failed';
    console.error('Content generation error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
