import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, url, text } = body;

    // If user pasted text directly, just return it
    if (type === 'text' && text) {
      return NextResponse.json({ success: true, extractedText: text.trim() });
    }

    // If user provided a company URL, scrape it
    if (type === 'url' && url) {
      const extractedText = await scrapeWebsite(url);
      return NextResponse.json({ success: true, extractedText });
    }

    return NextResponse.json(
      { success: false, error: 'Provide either text or a URL' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Extraction failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function scrapeWebsite(url: string): Promise<string> {
  // Normalize URL
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, nav, footer, header, iframe, noscript, svg').remove();

  // Try to get content from common "about" sections or main content
  const selectors = [
    'main',
    'article',
    '[role="main"]',
    '.about',
    '#about',
    '.content',
    '#content',
    '.main-content',
    '#main-content',
  ];

  let mainContent = '';
  for (const selector of selectors) {
    const el = $(selector);
    if (el.length && el.text().trim().length > 100) {
      mainContent = el.text().trim();
      break;
    }
  }

  // Fallback to body if no main content found
  if (!mainContent || mainContent.length < 50) {
    mainContent = $('body').text().trim();
  }

  // Clean up whitespace
  mainContent = mainContent
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // Also extract meta description and title
  const title = $('title').first().text().trim();
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
  const ogDesc = $('meta[property="og:description"]').attr('content')?.trim() || '';

  const header = [title, metaDesc, ogDesc].filter(Boolean).join('\n');

  return `${header}\n\n${mainContent}`.trim();
}
