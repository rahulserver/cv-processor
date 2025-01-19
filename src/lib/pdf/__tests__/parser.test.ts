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
    extractedText = await extractTextFromPDF(samplePDFBuffer);
  }, 15000);

  describe('AI-powered CV parsing', () => {
    let parsedCV: ParsedCV;

    beforeAll(async () => {
      parsedCV = await parseCV(extractedText);
    }, 30000); // Increased timeout for AI processing

    it('should extract career objective using AI', () => {
      expect(parsedCV.objective).toBeTruthy();
      expect(typeof parsedCV.objective).toBe('string');
      // We can't expect exact text matches since AI responses may vary
      expect(parsedCV.objective.toLowerCase()).toContain('electrical engineer');
    });

    it('should extract skills as an array', () => {
      expect(Array.isArray(parsedCV.skills)).toBe(true);
      expect(parsedCV.skills.length).toBeGreaterThan(0);
      // Check for some expected skills but don't require exact matches
      expect(parsedCV.skills.some(skill => 
        skill.toLowerCase().includes('tools') ||
        skill.toLowerCase().includes('electrical') ||
        skill.toLowerCase().includes('maintenance')
      )).toBe(true);
    });

    it('should extract work experience with required fields', () => {
      expect(Array.isArray(parsedCV.experience)).toBe(true);
      expect(parsedCV.experience.length).toBeGreaterThan(0);
      
      const firstJob = parsedCV.experience[0];
      expect(firstJob).toHaveProperty('company');
      expect(firstJob).toHaveProperty('position');
      expect(firstJob).toHaveProperty('period');
      expect(firstJob).toHaveProperty('responsibilities');
      expect(Array.isArray(firstJob.responsibilities)).toBe(true);
    });

    it('should handle empty input gracefully', async () => {
      await expect(parseCV('')).rejects.toThrow();
    });
  });
});