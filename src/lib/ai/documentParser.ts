/**
 * Document Parser Service
 * Extracts text content from PDF, DOCX, PPTX files
 */

import mammoth from 'mammoth';

interface ParsedDocument {
  text: string;
  metadata: Record<string, unknown>;
}

/**
 * Parses a document based on its mimeType
 */
export async function parseDocument(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
  switch (mimeType) {
    case 'application/pdf':
      return parsePDF(buffer);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return parseDOCX(buffer);

    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
      return parsePPTX(buffer);

    case 'text/plain':
      return { text: buffer.toString('utf-8'), metadata: {} };

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Parse PDF using pdf-parse (same approach as CourseCreatorNEW)
 */
async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  let info: any = {};
  try {
    const infoResult = await parser.getInfo();
    info = infoResult?.info || {};
  } catch {}

  return {
    text: String(result?.text || ''),
    metadata: {
      title: info.Title,
      author: info.Author,
      pageCount: result?.totalPages,
    },
  };
}

/**
 * Parse DOCX using mammoth
 */
async function parseDOCX(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value, metadata: {} };
}

/**
 * Parse PPTX using officeparser v6
 */
async function parsePPTX(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const { parseOffice } = require('officeparser');
    const result = await parseOffice(buffer);
    // officeparser v6 returns an object with toText() method
    const text = typeof result === 'string' ? result : result?.toText?.() || String(result || '');
    return { text, metadata: {} };
  } catch (error) {
    console.error('[parsePPTX] Error:', error);
    return { text: '', metadata: {} };
  }
}

/**
 * Clean and normalize extracted text
 */
export function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Split text into sections based on headings
 */
export function splitIntoSections(text: string): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = [];
  const lines = text.split('\n');
  let currentSection: { title: string; content: string } | null = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const isHeading =
      /^[A-Z\s]{3,50}$/.test(trimmed) ||
      /^\d+\.\s+[A-Z]/.test(trimmed) ||
      /^(Chapter|Section|Part)\s+\d+/i.test(trimmed);

    if (isHeading && trimmed.length > 0 && trimmed.length < 100) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: trimmed, content: '' };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    } else {
      currentSection = { title: 'Introduction', content: line + '\n' };
    }
  });

  if (currentSection) sections.push(currentSection);
  return sections.filter((s) => s.content.trim().length > 0);
}
