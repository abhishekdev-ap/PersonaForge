import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
];

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

async function callGroq(apiKey: string, prompt: string, userInput: string): Promise<string> {
  let lastError = '';

  for (const model of MODELS) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: userInput },
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.status === 403) {
        throw new Error(
          'Groq API returned 403 Forbidden. Your API key may be invalid, expired, or not yet activated. Please verify at console.groq.com'
        );
      }

      if (response.status === 429) {
        console.warn(`Groq rate limited on model ${model}, trying next...`);
        lastError = 'Rate limited — all models busy. Please try again in a moment.';
        continue;
      }

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`Groq API error (model: ${model}):`, errBody);
        lastError = `Groq API error: ${response.status}`;
        continue;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('403 Forbidden')) throw err;
      lastError = err instanceof Error ? err.message : 'Unknown error';
      continue;
    }
  }

  throw new Error(lastError || 'All Groq models failed');
}

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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      return NextResponse.json(
        {
          success: false,
          error:
            'GROQ_API_KEY is not configured. Please add your key to the .env file and restart the server.',
        },
        { status: 500 }
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

    const content = await callGroq(apiKey, systemPrompt, userMessage);

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
