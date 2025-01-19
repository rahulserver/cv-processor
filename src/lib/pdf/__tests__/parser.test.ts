/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
import { extractTextFromPDF, parseCV } from '../parser';
import { ParsedCV } from '../types';

describe('CV Parser', () => {
  let samplePDFBuffer: Buffer;
  let extractedText: string;

  beforeAll(async () => {
    const pdfPath = path.join(__dirname, 'resources', 'sample-cv.pdf');
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Test PDF file not found at ${pdfPath}`);
    }
    samplePDFBuffer = fs.readFileSync(pdfPath);

    // Extract text once for all tests
    extractedText = await extractTextFromPDF(samplePDFBuffer);
  }, 15000);

  describe('extractTextFromPDF', () => {
    it('should successfully extract text from sample CV', () => {
      expect(extractedText).toBeTruthy();
      expect(typeof extractedText).toBe('string');
      // Basic content checks
      expect(extractedText.toLowerCase()).toContain('career objective');
      expect(extractedText.toLowerCase()).toContain('key skills');
      expect(extractedText.toLowerCase()).toContain('work history');
    });
  });

  describe('parseCV', () => {
    let parsedCV: ParsedCV;

    beforeAll(() => {
      parsedCV = parseCV(extractedText);
    });

    it('should return a valid ParsedCV structure', () => {
      expect(parsedCV).toHaveProperty('objective');
      expect(parsedCV).toHaveProperty('skills');
      expect(parsedCV).toHaveProperty('experience');
      expect(parsedCV).toHaveProperty('education');
    });

    it('should store cleaned text in objective field', () => {
      expect(parsedCV.objective).toBeTruthy();
      expect(typeof parsedCV.objective).toBe('string');
      expect(parsedCV.objective).not.toMatch(/\s{2,}/); // No multiple spaces
    });

    // Pending tests for future AI implementation
    it.todo('should use AI to extract career objective');
    it.todo('should use AI to extract skills');
    it.todo('should use AI to extract work experience');
    it.todo('should use AI to extract education');
  });
});
