import { NextRequest, NextResponse } from 'next/server';

const PERSONA_EXTRACTION_PROMPT = `You are an expert at analyzing professional profiles and business information to extract structured identity signals.

Given the following text from a professional profile or company website, extract a structured persona. Return ONLY valid JSON with no markdown formatting, no code blocks, no backticks.

For an INDIVIDUAL profile, extract:
{
  "type": "individual",
  "name": "Full name if found, otherwise empty string",
  "role": "Current job title / role",
  "industry": "Industry or domain they work in",
  "seniority": "junior | mid-level | senior | executive | founder",
  "company": "Current company name if mentioned",
  "skills": ["list of key skills/expertise areas"],
  "interests": ["list of professional interests/topics they care about"],
  "tone_preference": "formal | casual | technical | entrepreneurial",
  "summary": "A 2-3 sentence professional summary"
}

For a COMPANY profile, extract:
{
  "type": "company",
  "name": "Company name",
  "industry": "Primary industry/domain",
  "size": "startup | small | medium | large | enterprise",
  "target_audience": "Description of who they serve",
  "offerings": ["list of products/services"],
  "tone": "professional | friendly | technical | bold | premium",
  "values": ["list of brand values/mission keywords"],
  "summary": "A 2-3 sentence company summary"
}

TEXT TO ANALYZE:
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Text is too short to extract a persona' },
        { status: 400 }
      );
    }

    // Use z-ai-web-dev-sdk (no API key needed — built-in LLM access)
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: PERSONA_EXTRACTION_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content = completion.choices?.[0]?.message?.content || '';

    const { parseLlmJson } = await import('@/lib/llm-json');
    const persona = parseLlmJson(content);

    return NextResponse.json({ success: true, persona });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Persona extraction failed';
    console.error('Persona extraction error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
