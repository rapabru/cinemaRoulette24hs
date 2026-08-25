export interface ExportableRow {
  title: string;
  year: string;
  rating: string;
  dateLabel: string;
}

function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsTxt(filename: string, title: string, rows: ExportableRow[]): void {
  const lines = [
    title,
    '='.repeat(title.length),
    '',
    ...rows.map(
      (r, i) => `${i + 1}. ${r.title}${r.year ? ` (${r.year})` : ''} — ${r.rating} — ${r.dateLabel}`
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  triggerDownload(filename, blob);
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** CSV with a UTF-8 BOM so Excel opens accented characters correctly. */
export function exportAsCsv(filename: string, rows: ExportableRow[]): void {
  const headers = ['Título', 'Año', 'Rating', 'Fecha'];
  const table = [headers, ...rows.map((r) => [r.title, r.year, r.rating, r.dateLabel])];
  const csv = table.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(filename, blob);
}

// --- Minimal, dependency-free PDF generator (single-column text list, auto-paginated) ---

function toLatin1(text: string): string {
  return Array.from(text)
    .map((ch) => ((ch.codePointAt(0) || 63) <= 255 ? ch : '?'))
    .join('');
}

function escapePdfText(text: string): string {
  return toLatin1(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdf(title: string, lines: string[]): Blob {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const titleFontSize = 16;
  const fontSize = 10;
  const lineHeight = 15;
  const headerSpace = titleFontSize + 14;

  const linesPerPage = Math.max(1, Math.floor((pageHeight - margin * 2 - headerSpace) / lineHeight));
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push([]);

  const pageObjNums = pages.map((_, i) => 3 + i * 2);
  const contentObjNums = pages.map((_, i) => 4 + i * 2);
  const fontObjNum = 3 + pages.length * 2;

  const objects: string[] = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj\n`
  );

  pages.forEach((pageLines, idx) => {
    const y = pageHeight - margin;
    let content = `BT\n/F1 ${titleFontSize} Tf\n${margin} ${y} Td\n(${escapePdfText(title)}) Tj\n`;
    content += `/F1 ${fontSize} Tf\n0 -${headerSpace} Td\n`;
    pageLines.forEach((line, i) => {
      const text = escapePdfText(line);
      content += i === 0 ? `(${text}) Tj\n` : `0 -${lineHeight} Td (${text}) Tj\n`;
    });
    content += `ET\n`;

    objects.push(
      `${pageObjNums[idx]} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNums[idx]} 0 R >>\nendobj\n`
    );
    objects.push(`${contentObjNums[idx]} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  });

  objects.push(`${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += objects[i];
  }

  const xrefOffset = pdf.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += xref;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: 'application/pdf' });
}

export function exportAsPdf(filename: string, title: string, rows: ExportableRow[]): void {
  const lines = rows.map(
    (r, i) => `${i + 1}. ${r.title}${r.year ? ` (${r.year})` : ''} - ${r.rating} - ${r.dateLabel}`
  );
  const blob = buildSimplePdf(title, lines);
  triggerDownload(filename, blob);
}
