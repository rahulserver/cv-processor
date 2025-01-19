import fs from 'fs';
import path from 'path';
import { extractTextFromPDF, parseCV } from '../parser';
import { ParsedCV } from '../types';

describe('CV Parser', () => {
  let samplePDFBuffer: Buffer;

  beforeAll(() => {
    const pdfPath = path.join(__dirname, 'resources', 'sample-cv.pdf');
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Test PDF file not found at ${pdfPath}`);
    }
    samplePDFBuffer = fs.readFileSync(pdfPath);
  });

  describe('extractTextFromPDF', () => {
    it('should successfully extract text from sample CV', async () => {
      const extractedText = await extractTextFromPDF(samplePDFBuffer);
      expect(extractedText).toBeTruthy();
      expect(typeof extractedText).toBe('string');
      expect(extractedText.toLowerCase()).toContain('career objective');
      expect(extractedText.toLowerCase()).toContain('key skills');
      expect(extractedText.toLowerCase()).toContain('work history');
    }, 10000);
  });

  describe('parseCV', () => {
    let extractedText: string;

    beforeAll(async () => {
      extractedText = await extractTextFromPDF(samplePDFBuffer);
    }, 10000);

    it('should correctly parse career objective', () => {
      const result = parseCV(extractedText);
      expect(result.objective).toContain('dedicated and highly motivated electrical engineer');
    });

    it('should correctly parse key skills', () => {
      const result = parseCV(extractedText);
      expect(result.skills).toContain('Operating hand and power tools');
      expect(result.skills).toContain('Stock control');
      expect(result.skills).toContain('Forklift and EWP experience');
    });

    it('should correctly parse work experience', () => {
      const result = parseCV(extractedText);
      
      expect(result.experience[0]).toMatchObject({
        company: 'ZMS Electrical',
        position: 'Electrician',
        period: '2022-2023'
      });

      expect(result.experience[1]).toMatchObject({
        company: 'Test Aged Care',
        position: 'Maintenance Manager',
        period: '2018-2022'
      });
    });
  });
});
