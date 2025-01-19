import { extractTextFromPDF, parseCV } from '../parser';
import { ParsedCV } from '../types';

describe('PDF Parser', () => {
  const sampleCVText = `CAREER OBJECTIVE
    I am a dedicated and highly motivated electrical engineer with a strong passion for innovation.
    
    KEY SKILLS
    • Operating hand and power tools
    • Stock control
    
    WORK HISTORY
    ZMS Electrical | Electrician 2022-2023
    ● General Electrical work
    ● Commercial Solar works`;

  describe('parseCV', () => {
    it('should correctly parse career objective', () => {
      const result = parseCV(sampleCVText);
      expect(result.objective).toContain('dedicated and highly motivated electrical engineer');
    });

    it('should correctly parse skills', () => {
      const result = parseCV(sampleCVText);
      expect(result.skills).toContain('Operating hand and power tools');
      expect(result.skills).toContain('Stock control');
    });

    it('should correctly parse work experience', () => {
      const result = parseCV(sampleCVText);
      expect(result.experience[0]).toMatchObject({
        company: 'ZMS Electrical',
        position: 'Electrician',
        period: '2022-2023',
        responsibilities: [
          'General Electrical work',
          'Commercial Solar works'
        ]
      });
    });

    it('should handle empty input', () => {
      const result = parseCV('');
      expect(result).toEqual({
        objective: '',
        skills: [],
        experience: [],
        education: []
      });
    });
  });

  describe('extractTextFromPDF', () => {
    it('should throw error for invalid PDF buffer', async () => {
      const invalidBuffer = Buffer.from('invalid pdf content');
      await expect(extractTextFromPDF(invalidBuffer)).rejects.toThrow();
    });
  });
});