import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Fallback model chain — try these in order if the first fails
const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
];

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
          temperature: 0.3,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.status === 403) {
        const errBody = await response.text();
        console.error(`Groq 403 Forbidden (model: ${model}):`, errBody);
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
    const { text } = body;

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Text is too short to extract a persona' },
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

    const content = await callGroq(apiKey, PERSONA_EXTRACTION_PROMPT, text);

    let persona;
    try {
      persona = JSON.parse(content);
    } catch {
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
