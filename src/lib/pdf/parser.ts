import PDFParser from 'pdf-parse';
import { ParsedCV } from './types';
import { processCVWithAI } from '../agents/cv-processor';

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const data = await PDFParser(pdfBuffer, {
    preserveFormattingNewlines: true,
  });
  
  return data.text;
}

export async function parseCV(text: string): Promise<ParsedCV> {
  if (!text || text.trim() === '') {
    throw new Error('Text is required');
  }
  return processCVWithAI(text);
}
