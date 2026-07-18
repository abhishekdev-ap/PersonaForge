import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { copies, persona } = body;

    if (!copies || !Array.isArray(copies) || copies.length === 0) {
      return NextResponse.json({ success: false, error: 'Marketing copies are required' }, { status: 400 });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 55, right: 55 },
      info: {
        Title: `Marketing Copy — ${persona?.name || 'Company'}`,
        Author: 'PersonaForge',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Colors
    const emerald = '#059669';
    const dark = '#111827';
    const muted = '#6B7280';
    const border = '#E5E7EB';

    // Register fonts - use built-in Helvetica for compatibility
    const fontBold = 'Helvetica-Bold';
    const fontRegular = 'Helvetica';
    const fontItalic = 'Helvetica-Oblique';
    const fontBoldItalic = 'Helvetica-BoldOblique';

    copies.forEach((copy: Record<string, unknown>, copyIndex: number) => {
      if (copyIndex > 0) doc.addPage();

      // Header bar
      doc.rect(0, 0, doc.page.width, 80).fill(emerald);
      doc.fontSize(24).font(fontBold).fillColor('#FFFFFF');
      doc.text(String(copy.title || 'Marketing Copy'), 55, 25, { width: doc.page.width - 110 });
      doc.fontSize(10).font(fontRegular);
      doc.text(String(persona?.name || 'Company'), 55, 55, { width: doc.page.width - 110 });

      let y = 110;

      // Angle + Tagline
      doc.fontSize(10).font(fontBold).fillColor(emerald);
      doc.text(`Angle: ${String(copy.angle || '')}`, 55, y);
      y += 18;
      doc.fontSize(12).font(fontItalic).fillColor(dark);
      doc.text(`"${String(copy.tagline || '')}"`, 55, y, { width: doc.page.width - 110 });
      y += 30;

      // Divider
      doc.moveTo(55, y).lineTo(doc.page.width - 55, y).strokeColor(border).lineWidth(1).stroke();
      y += 20;

      // Executive Summary
      doc.fontSize(11).font(fontBold).fillColor(emerald);
      doc.text('EXECUTIVE SUMMARY', 55, y);
      y += 18;
      doc.fontSize(10).font(fontRegular).fillColor(dark);
      doc.text(String(copy.executive_summary || ''), 55, y, { width: doc.page.width - 110, lineGap: 3 });
      y = doc.y + 20;

      // Features
      const features = copy.features as { name: string; description: string; benefit: string }[] | undefined;
      if (features && features.length > 0) {
        doc.fontSize(11).font(fontBold).fillColor(emerald);
        doc.text('FEATURES & BENEFITS', 55, y);
        y += 20;

        features.forEach((f) => {
          if (y > doc.page.height - 120) {
            doc.addPage();
            y = 60;
          }

          // Feature name
          doc.fontSize(10).font(fontBold).fillColor(dark);
          doc.text(f.name, 55, y, { width: doc.page.width - 110 });
          y = doc.y + 4;

          // Description
          doc.fontSize(9).font(fontRegular).fillColor(muted);
          doc.text(f.description, 55, y, { width: doc.page.width - 110, lineGap: 2 });
          y = doc.y + 4;

          // Benefit
          doc.fontSize(9).font(fontBoldItalic).fillColor(emerald);
          doc.text(`Benefit: ${f.benefit}`, 55, y, { width: doc.page.width - 110 });
          y = doc.y + 14;
        });
      }

      y += 10;

      // USPs
      const usps = copy.usps as { title: string; description: string; proof: string }[] | undefined;
      if (usps && usps.length > 0) {
        if (y > doc.page.height - 150) {
          doc.addPage();
          y = 60;
        }

        doc.fontSize(11).font(fontBold).fillColor(emerald);
        doc.text('UNIQUE SELLING PROPOSITIONS', 55, y);
        y += 20;

        usps.forEach((u) => {
          if (y > doc.page.height - 120) {
            doc.addPage();
            y = 60;
          }

          // USP box
          const boxX = 55;
          const boxWidth = doc.page.width - 110;

          doc.fontSize(10).font(fontBold).fillColor(dark);
          doc.text(u.title, boxX + 10, y + 10, { width: boxWidth - 20 });
          y = doc.y + 4;

          doc.fontSize(9).font(fontRegular).fillColor(muted);
          doc.text(u.description, boxX + 10, y, { width: boxWidth - 20, lineGap: 2 });
          y = doc.y + 4;

          doc.fontSize(9).font(fontItalic).fillColor(muted);
          doc.text(`Proof: ${u.proof}`, boxX + 10, y, { width: boxWidth - 20 });
          y = doc.y + 18;
        });
      }

      y += 10;

      // Closing
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 60;
      }

      doc.moveTo(55, y).lineTo(doc.page.width - 55, y).strokeColor(border).lineWidth(1).stroke();
      y += 15;
      doc.fontSize(10).font(fontRegular).fillColor(dark);
      doc.text(String(copy.closing_statement || ''), 55, y, { width: doc.page.width - 110, lineGap: 3 });
    });

    // Footer on last page
    doc.fontSize(8).font(fontRegular).fillColor(muted);
    doc.text('Generated by PersonaForge — AI-Powered Content Engine', 55, doc.page.height - 40, {
      width: doc.page.width - 110,
      align: 'center',
    });

    doc.end();

    // Wait for the PDF to be fully generated
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="marketing-copy-${Date.now()}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'PDF export failed';
    console.error('PDF export error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
