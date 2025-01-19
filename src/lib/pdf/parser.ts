import PDFParser from 'pdf-parse';
import { ParsedCV } from './types';

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const data = await PDFParser(pdfBuffer, {
    // Preserve formatting and line breaks
    preserveFormattingNewlines: true,
  });
  
  return data.text;
}

export function parseCV(text: string): ParsedCV {
  // Initialize with empty structure
  const cv: ParsedCV = {
    objective: '',
    skills: [],
    experience: [],
    education: [],
  };

  // Just clean up the text a bit to remove excessive whitespace
  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim();

  // Store the cleaned text in the objective field for now
  // This will be processed by AI later
  cv.objective = cleanText;

  return cv;
}
