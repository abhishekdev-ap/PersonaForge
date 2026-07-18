/**
 * Sanitize LLM JSON output: fix control characters that break JSON.parse
 *
 * The core problem: LLMs sometimes output raw newlines/tabs inside JSON string
 * values (e.g., the LinkedIn post content field), which is invalid JSON.
 * But newlines BETWEEN tokens (structural whitespace) are valid and must be preserved.
 *
 * Strategy: Find string values (between quotes) and escape any raw control chars inside them.
 */
export function sanitizeJson(raw: string): string {
  // Remove markdown code blocks if present
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

  // Process character by character: track whether we're inside a string,
  // and escape any control characters found within strings.
  let inString = false;
  let escaped = false;
  const result: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escaped) {
      // Previous char was backslash, this char is escaped — pass through
      result.push(ch);
      escaped = false;
      continue;
    }

    if (ch === '\\' && inString) {
      result.push(ch);
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result.push(ch);
      continue;
    }

    if (inString) {
      // Inside a string value — escape control characters
      if (ch === '\n') {
        result.push('\\n');
      } else if (ch === '\r') {
        // Skip bare CR, \r\n was already handled as \n above if it was just \n
        result.push('\\r');
      } else if (ch === '\t') {
        result.push('\\t');
      } else if (ch.charCodeAt(0) < 0x20) {
        // Other control characters — remove them
        // (they're not valid in JSON strings even escaped)
      } else {
        result.push(ch);
      }
    } else {
      // Outside a string — structural whitespace is fine, pass through
      result.push(ch);
    }
  }

  return result.join('');
}

/**
 * Robust JSON parser that handles common LLM output issues
 */
export function parseLlmJson<T = Record<string, unknown>>(raw: string): T {
  const sanitized = sanitizeJson(raw);

  try {
    return JSON.parse(sanitized) as T;
  } catch (firstError) {
    // Try to extract JSON object from surrounding text
    const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        // Last resort: log and throw
        console.error('Failed to parse extracted JSON:', (firstError as Error).message);
        throw new Error('Could not parse JSON from LLM response');
      }
    }
    console.error('Failed to parse LLM JSON:', (firstError as Error).message);
    throw new Error('Could not parse JSON from LLM response');
  }
}
