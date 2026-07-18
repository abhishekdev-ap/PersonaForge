import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variants, persona, contentType, format } = body;

    if (!variants || !format) {
      return NextResponse.json(
        { success: false, error: 'Variants and format are required' },
        { status: 400 }
      );
    }

    let exportedContent: string;
    let mimeType: string;
    let filename: string;

    if (format === 'txt') {
      exportedContent = formatAsText(variants, persona, contentType);
      mimeType = 'text/plain';
      filename = `content-variants-${Date.now()}.txt`;
    } else if (format === 'json') {
      exportedContent = JSON.stringify({ persona, contentType, variants }, null, 2);
      mimeType = 'application/json';
      filename = `content-variants-${Date.now()}.json`;
    } else if (format === 'md') {
      exportedContent = formatAsMarkdown(variants, persona, contentType);
      mimeType = 'text/markdown';
      filename = `content-variants-${Date.now()}.md`;
    } else {
      return NextResponse.json(
        { success: false, error: `Unsupported format: ${format}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content: exportedContent,
      mimeType,
      filename,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Export failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function formatAsText(
  variants: Record<string, unknown>[],
  persona: Record<string, unknown>,
  contentType: string
): string {
  const lines: string[] = [];
  lines.push('='.repeat(60));
  lines.push(`PERSONA: ${persona.name || 'Unknown'}`);
  lines.push(`TYPE: ${persona.type || 'N/A'}`);
  lines.push(`CONTENT TYPE: ${contentType}`);
  lines.push('='.repeat(60));
  lines.push('');

  variants.forEach((variant, i) => {
    lines.push(`--- VARIANT ${i + 1}: ${variant.title || 'Untitled'} ---`);
    lines.push(`Angle: ${variant.angle || 'N/A'}`);
    lines.push('');
    Object.entries(variant).forEach(([key, value]) => {
      if (key === 'title' || key === 'angle') return;
      if (Array.isArray(value)) {
        lines.push(`${formatKey(key)}:`);
        value.forEach((item) => lines.push(`  - ${item}`));
      } else {
        lines.push(`${formatKey(key)}: ${value}`);
      }
    });
    lines.push('');
  });

  return lines.join('\n');
}

function formatAsMarkdown(
  variants: Record<string, unknown>[],
  persona: Record<string, unknown>,
  contentType: string
): string {
  const lines: string[] = [];
  lines.push(`# Content Variants — ${persona.name || 'Unknown'}`);
  lines.push('');
  lines.push(`**Persona Type:** ${persona.type || 'N/A'}`);
  lines.push(`**Content Type:** ${contentType}`);
  lines.push('');

  variants.forEach((variant, i) => {
    lines.push(`## Variant ${i + 1}: ${variant.title || 'Untitled'}`);
    lines.push(`**Angle:** ${variant.angle || 'N/A'}`);
    lines.push('');
    Object.entries(variant).forEach(([key, value]) => {
      if (key === 'title' || key === 'angle') return;
      if (Array.isArray(value)) {
        lines.push(`### ${formatKey(key)}`);
        value.forEach((item) => lines.push(`- ${item}`));
        lines.push('');
      } else {
        lines.push(`### ${formatKey(key)}`);
        lines.push('');
        lines.push(String(value));
        lines.push('');
      }
    });
  });

  return lines.join('\n');
}

function formatKey(key: string): string {
  return key
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
