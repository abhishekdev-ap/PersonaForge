import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured. Please add it to your .env file.' },
        { status: 500 }
      );
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: PERSONA_EXTRACTION_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      return NextResponse.json(
        { success: false, error: `Groq API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let persona;
    try {
      persona = JSON.parse(content);
    } catch {
      // Try to extract JSON from possible markdown wrapping
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        persona = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse persona JSON from LLM response');
      }
    }

    return NextResponse.json({ success: true, persona });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Persona extraction failed';
    console.error('Persona extraction error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
