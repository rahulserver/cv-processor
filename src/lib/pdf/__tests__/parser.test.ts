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
    console.log('Extracted text:', extractedText); // Debugging output
  }, 15000);

  describe('extractTextFromPDF', () => {
    it('should successfully extract text from sample CV', () => {
      expect(extractedText).toBeTruthy();
      expect(typeof extractedText).toBe('string');
      expect(extractedText.toLowerCase()).toContain('career objective');
      expect(extractedText.toLowerCase()).toContain('key skills');
      expect(extractedText.toLowerCase()).toContain('work history');
    });
  });

  describe('parseCV', () => {
    let parsedCV: ParsedCV;

    beforeAll(() => {
      parsedCV = parseCV(extractedText);
      console.log('Parsed CV:', JSON.stringify(parsedCV, null, 2));
    });

    it('should correctly parse career objective', () => {
      expect(parsedCV.objective).toBeTruthy();
      expect(parsedCV.objective.toLowerCase()).toContain('dedicated and highly motivated electrical engineer');
    });

    it('should correctly parse key skills', () => {
      expect(parsedCV.skills).toHaveLength(8); // Adjust this number based on your actual CV
      expect(parsedCV.skills.some(skill => skill.toLowerCase().includes('operating hand and power tools'))).toBeTruthy();
      expect(parsedCV.skills.some(skill => skill.toLowerCase().includes('stock control'))).toBeTruthy();
      expect(parsedCV.skills.some(skill => skill.toLowerCase().includes('forklift and ewp experience'))).toBeTruthy();
    });

    it('should correctly parse work experience', () => {
      expect(parsedCV.experience).toHaveLength(4); // Adjust based on your CV

      const zmsExperience = parsedCV.experience.find(exp =>
        exp.company.toLowerCase().includes('zms electrical'),
      );
      expect(zmsExperience).toBeDefined();
      expect(zmsExperience).toMatchObject({
        company: expect.stringMatching(/ZMS Electrical/i),
        position: expect.stringMatching(/Electrician/i),
        period: '2022-2023',
      });

      const agedCareExperience = parsedCV.experience.find(exp =>
        exp.company.toLowerCase().includes('test aged care'),
      );
      expect(agedCareExperience).toBeDefined();
      expect(agedCareExperience).toMatchObject({
        company: expect.stringMatching(/Test Aged Care/i),
        position: expect.stringMatching(/Maintenance Manager/i),
        period: '2018-2022',
      });
    });
  });
});
