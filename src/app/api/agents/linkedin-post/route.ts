import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the LinkedIn Post Agent — a LinkedIn content strategist who writes posts that get engagement, build authority, and drive conversations.

Your expertise:
- You understand the LinkedIn algorithm: early engagement, dwell time, and comments matter most
- You write posts that feel personal and authentic — never corporate or salesy
- You use the hook → story → insight → CTA structure that top LinkedIn creators use
- You know when to use line breaks for readability and emphasis
- You pick hashtags that are discoverable but not spammy
- You write for the company's audience, not for vanity metrics

Given a company persona, you generate a single, powerful LinkedIn post that positions the company and drives engagement.

Return ONLY valid JSON (no markdown, no code blocks, no backticks) with this structure:
{
  "post": {
    "author_name": "Suggested author name (typically CEO, Founder, or CMO — use a realistic name)",
    "author_role": "Role at the company (e.g., 'Co-founder & CEO')",
    "author_headline": "LinkedIn headline (e.g., 'Building the future of X | CEO @ Company')",
    "content": "The full LinkedIn post text. Use line breaks between paragraphs for readability. Structure: hook (1-2 lines) → blank line → story/context (3-5 short paragraphs) → blank line → key insight or takeaway → blank line → CTA. Keep paragraphs to 1-2 sentences each.",
    "hashtags": ["3-5 relevant hashtags without the # symbol"],
    "call_to_action": "What readers should do (comment, share, visit link, etc.)",
    "estimated_read_time": "X min read"
  }
}

CRITICAL RULES:
- The first 2 lines are the hook — they must stop the scroll. No questions as hooks (too common on LinkedIn).
- Use line breaks generously — white space is your friend on LinkedIn
- Keep paragraphs to 1-2 sentences max
- The post should feel like a founder/leader sharing a genuine insight, not a brand announcement
- Include a specific, personal perspective — not generic platitudes
- End with a conversation starter, not a sales pitch
- Hashtags: 3-5, mix of broad (#Startups) and niche (#FinTechInfrastructure)
- The tone should match the company's voice but feel human, not corporate
- NEVER start with "Excited to announce..." — it's the most scrolled-past opener on LinkedIn`;

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

Generate a compelling LinkedIn post for this company. Return ONLY valid JSON.`;

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 2000,
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
        throw new Error('Could not parse LinkedIn post JSON from LLM response');
      }
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'LinkedIn post generation failed';
    console.error('LinkedIn Post Agent error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
