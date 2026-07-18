import { NextRequest, NextResponse } from 'next/server';

const CONTENT_GENERATION_PROMPTS: Record<string, string> = {
  'marketing-copy': `You are an expert marketing copywriter. Given the following persona and content brief, generate 3 distinct marketing copy variants. Each variant should have a different angle or hook but all should be tailored to the persona.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "variants": [
    {
      "title": "Short variant title describing the angle",
      "angle": "The strategy/approach used",
      "headline": "Attention-grabbing headline",
      "body": "The main marketing copy (2-3 paragraphs)",
      "cta": "Call-to-action text"
    }
  ]
}`,

  'landing-page': `You are an expert landing page copywriter. Given the following persona and content brief, generate 3 distinct landing page copy variants. Each should have a different approach but all should be tailored to the persona.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "variants": [
    {
      "title": "Short variant title describing the approach",
      "angle": "The strategy/approach used",
      "hero_headline": "Main hero section headline",
      "hero_subheadline": "Supporting sub-headline",
      "value_propositions": ["3-4 key value props"],
      "cta": "Call-to-action button text",
      "social_proof": "A social proof line or testimonial-style quote"
    }
  ]
}`,

  'ui-microcopy': `You are an expert UI/UX copywriter. Given the following persona and content brief, generate 3 sets of UI microcopy variants. Each set should have a different tone/approach but all should be tailored to the persona.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "variants": [
    {
      "title": "Short variant title describing the tone",
      "angle": "The tone/approach used",
      "onboarding_welcome": "Welcome message for first-time users",
      "empty_state": "Empty state message",
      "success_message": "Success/completion message",
      "error_message": "Error state message (friendly, not alarming)",
      "tooltip": "A helpful tooltip text",
      "cta_primary": "Primary CTA button text",
      "cta_secondary": "Secondary CTA button text"
    }
  ]
}`,

  'email-sequence': `You are an expert email copywriter. Given the following persona and content brief, generate 3 email variants with different subject lines and approaches.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "variants": [
    {
      "title": "Short variant title describing the approach",
      "angle": "The strategy/approach used",
      "subject_line": "Email subject line",
      "preview_text": "Preview text that appears next to subject",
      "opening": "Opening line/paragraph",
      "body": "Main email body (2-3 paragraphs)",
      "cta": "Call-to-action text",
      "sign_off": "Closing/sign-off line"
    }
  ]
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

Generate 3 distinct content variants now. Remember: return ONLY valid JSON.`;

    // Use z-ai-web-dev-sdk (no API key needed — built-in LLM access)
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2048,
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
