import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage
} from 'pdf-lib';
import type { CvDocument, CvExperienceSection, CvProjectSection } from './cv';

const A4: [number, number] = [595.28, 841.89];
const MARGIN_X = 46;
const CONTENT_WIDTH = A4[0] - MARGIN_X * 2;
const TEXT = rgb(0.08, 0.08, 0.08);
const MUTED = rgb(0.34, 0.34, 0.34);
const RULE = rgb(0.84, 0.84, 0.84);

function safeText(value: string) {
  return value
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/·/g, '/')
    .replace(/→/g, '->')
    .replace(/\s+/g, ' ')
    .trim();
}

function plainMarkdown(value: string) {
  return safeText(
    value
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[*_#>`]/g, '')
      .replace(/^[-+]\s+/gm, '')
  );
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = safeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

interface DrawBlockOptions {
  x?: number;
  y: number;
  width?: number;
  font: PDFFont;
  size: number;
  lineHeight: number;
  color?: ReturnType<typeof rgb>;
  maxLines?: number;
  prefix?: string;
}

function drawBlock(page: PDFPage, text: string, options: DrawBlockOptions) {
  const x = options.x ?? MARGIN_X;
  const width = options.width ?? CONTENT_WIDTH;
  const prefix = options.prefix ?? '';
  const prefixWidth = prefix ? options.font.widthOfTextAtSize(prefix, options.size) : 0;
  const firstWidth = width - prefixWidth;
  const lines = wrapText(text, options.font, options.size, firstWidth);
  const limited = options.maxLines ? lines.slice(0, options.maxLines) : lines;
  let y = options.y;

  limited.forEach((line, index) => {
    const linePrefix = index === 0 ? prefix : '';
    page.drawText(`${linePrefix}${line}`, {
      x,
      y,
      size: options.size,
      font: options.font,
      color: options.color ?? TEXT
    });
    y -= options.lineHeight;
  });

  return y;
}

function drawRule(page: PDFPage, y: number) {
  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: A4[0] - MARGIN_X, y },
    thickness: 0.6,
    color: RULE
  });
}

function drawSectionTitle(page: PDFPage, title: string, y: number, bold: PDFFont) {
  page.drawText(title.toUpperCase(), {
    x: MARGIN_X,
    y,
    size: 8.4,
    font: bold,
    color: TEXT
  });
  drawRule(page, y - 6);
  return y - 20;
}

function projectHeight(project: CvProjectSection, regular: PDFFont) {
  const descriptionLines = Math.min(
    3,
    wrapText(project.description, regular, 7.8, CONTENT_WIDTH).length
  );
  return 42 + descriptionLines * 9.8;
}

function drawProject(
  page: PDFPage,
  project: CvProjectSection,
  y: number,
  regular: PDFFont,
  bold: PDFFont
) {
  page.drawText(safeText(project.title), {
    x: MARGIN_X,
    y,
    size: 9.6,
    font: bold,
    color: TEXT
  });

  const meta = `${project.role} | ${project.year}`;
  page.drawText(safeText(meta), {
    x: MARGIN_X,
    y: y - 12,
    size: 7.1,
    font: regular,
    color: MUTED
  });

  let nextY = drawBlock(page, project.description, {
    y: y - 25,
    font: regular,
    size: 7.8,
    lineHeight: 9.8,
    maxLines: 3
  });

  nextY -= 2;
  nextY = drawBlock(page, `Stack: ${project.tech.join(', ')}`, {
    y: nextY,
    font: regular,
    size: 6.8,
    lineHeight: 8.5,
    color: MUTED,
    maxLines: 1
  });

  drawBlock(page, project.url.replace(/^https?:\/\//, ''), {
    y: nextY,
    font: regular,
    size: 6.7,
    lineHeight: 8.2,
    color: MUTED,
    maxLines: 1
  });

  return y - projectHeight(project, regular);
}

function drawExperience(
  page: PDFPage,
  experience: CvExperienceSection,
  y: number,
  regular: PDFFont,
  bold: PDFFont
) {
  page.drawText(safeText(`${experience.role} | ${experience.company}`), {
    x: MARGIN_X,
    y,
    size: 9.2,
    font: bold,
    color: TEXT
  });

  page.drawText(safeText(experience.year), {
    x: MARGIN_X,
    y: y - 12,
    size: 7.1,
    font: regular,
    color: MUTED
  });

  let nextY = drawBlock(page, experience.summary, {
    y: y - 25,
    font: regular,
    size: 7.7,
    lineHeight: 9.6,
    maxLines: 2
  });

  for (const bullet of experience.bullets.slice(0, 2)) {
    nextY -= 1;
    nextY = drawBlock(page, bullet, {
      x: MARGIN_X + 8,
      y: nextY,
      width: CONTENT_WIDTH - 8,
      font: regular,
      size: 7.4,
      lineHeight: 9.2,
      maxLines: 2,
      prefix: '- '
    });
  }

  if (experience.evidence.length) {
    const evidence = experience.evidence
      .map(
        (project) =>
          `${project.title} (${project.url.replace(/^https?:\/\//, '')})`
      )
      .join('; ');

    nextY -= 1;
    nextY = drawBlock(page, `Project evidence: ${evidence}`, {
      y: nextY,
      font: regular,
      size: 6.7,
      lineHeight: 8.4,
      color: MUTED,
      maxLines: 2
    });
  }

  return nextY - 10;
}

function drawHeader(
  page: PDFPage,
  document: CvDocument,
  regular: PDFFont,
  bold: PDFFont
) {
  let y = A4[1] - 48;

  page.drawText(safeText(document.name).toUpperCase(), {
    x: MARGIN_X,
    y,
    size: 17,
    font: bold,
    color: TEXT
  });

  y -= 18;
  page.drawText(safeText(document.headline), {
    x: MARGIN_X,
    y,
    size: 9.3,
    font: regular,
    color: TEXT
  });

  y -= 14;
  drawBlock(page, document.contact, {
    y,
    font: regular,
    size: 7.1,
    lineHeight: 8.5,
    color: MUTED,
    maxLines: 2
  });

  y -= 18;
  drawRule(page, y);
  return y - 22;
}

function drawProfileAndSkills(
  page: PDFPage,
  document: CvDocument,
  y: number,
  regular: PDFFont,
  bold: PDFFont
) {
  y = drawSectionTitle(page, 'Profile', y, bold);
  y = drawBlock(page, document.profileSummary, {
    y,
    font: regular,
    size: 8,
    lineHeight: 10.4,
    maxLines: 4
  });

  y -= 12;
  y = drawSectionTitle(page, 'Technical Scope', y, bold);

  for (const group of document.skillGroups) {
    const label = `${group.title}: `;
    const items = group.items.join(', ');
    const labelWidth = bold.widthOfTextAtSize(label, 7.3);

    page.drawText(safeText(label), {
      x: MARGIN_X,
      y,
      size: 7.3,
      font: bold,
      color: TEXT
    });

    y = drawBlock(page, items, {
      x: MARGIN_X + labelWidth,
      y,
      width: CONTENT_WIDTH - labelWidth,
      font: regular,
      size: 7.3,
      lineHeight: 9.2,
      maxLines: 2
    });
    y -= 2;
  }

  return y;
}

function drawEducation(
  page: PDFPage,
  document: CvDocument,
  y: number,
  regular: PDFFont,
  bold: PDFFont
) {
  y = drawSectionTitle(page, 'Education', y, bold);

  for (const item of document.education) {
    page.drawText(safeText(item.institution), {
      x: MARGIN_X,
      y,
      size: 9,
      font: bold,
      color: TEXT
    });

    y -= 12;
    page.drawText(safeText(`${item.program} | ${item.year}`), {
      x: MARGIN_X,
      y,
      size: 7.2,
      font: regular,
      color: MUTED
    });

    if (item.description.trim()) {
      y -= 12;
      y = drawBlock(page, plainMarkdown(item.description), {
        y,
        font: regular,
        size: 7.2,
        lineHeight: 9,
        maxLines: 2
      });
    }
  }

  return y;
}

export async function renderGeneralCvPdf(document: CvDocument) {
  if (document.pageBudget !== 2) {
    throw new Error('General CV renderer expects a two-page document.');
  }

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${document.name} - General CV`);
  pdf.setAuthor(document.name);
  pdf.setSubject('AI-selected grounded portfolio CV');

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const first = pdf.addPage(A4);
  let y = drawHeader(first, document, regular, bold);
  y = drawProfileAndSkills(first, document, y, regular, bold);
  y -= 9;
  y = drawSectionTitle(first, 'Selected Projects', y, bold);

  const firstPageProjects = document.projects.slice(0, 3);
  for (const project of firstPageProjects) {
    y = drawProject(first, project, y, regular, bold);
    y -= 5;
  }

  const second = pdf.addPage(A4);
  y = A4[1] - 50;

  const remainingProjects = document.projects.slice(3);
  if (remainingProjects.length) {
    y = drawSectionTitle(second, 'Selected Projects - Continued', y, bold);
    for (const project of remainingProjects) {
      y = drawProject(second, project, y, regular, bold);
      y -= 5;
    }
    y -= 2;
  }

  y = drawSectionTitle(second, 'Experience', y, bold);
  for (const experience of document.experiences) {
    y = drawExperience(second, experience, y, regular, bold);
  }

  if (y < 125) {
    y = 125;
  } else {
    y -= 2;
  }

  drawEducation(second, document, y, regular, bold);

  first.drawText('General CV / AI-selected from portfolio source data', {
    x: MARGIN_X,
    y: 24,
    size: 6.2,
    font: regular,
    color: MUTED
  });

  second.drawText('Generated from verified portfolio content - page 2 of 2', {
    x: MARGIN_X,
    y: 24,
    size: 6.2,
    font: regular,
    color: MUTED
  });

  return pdf.save();
}

export function triggerPdfDownload(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy.buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
