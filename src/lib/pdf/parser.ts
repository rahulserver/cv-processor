import * as pdfjsLib from 'pdfjs-dist';
import { ParsedCV } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;

  let extractedText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    extractedText += textContent.items
      .map((item: any) => item.str)
      .join(' ') + '\n';
  }

  return extractedText.replace(/\s+/g, ' ').trim();
}

export function parseCV(text: string): ParsedCV {
  const cv: ParsedCV = {
    objective: '',
    skills: [],
    experience: [],
    education: [],
  };

  // Parse career objective
  const objectiveMatch = text.match(/CAREER OBJECTIVE\s*(.+?)(?=KEY SKILLS|$)/i);
  if (objectiveMatch) {
    cv.objective = objectiveMatch[1].trim();
  }

  // Parse key skills
  const skillsMatch = text.match(/KEY SKILLS\s*(.+?)(?=WORK HISTORY|$)/i);
  if (skillsMatch) {
    cv.skills = skillsMatch[1]
      .split('•')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }

  // Parse work experience
  const experienceMatch = text.match(/WORK HISTORY\s*(.+?)(?=PREVIOUS EMPLOYMENT|EDUCATION|REFERENCES|$)/i);
  if (experienceMatch) {
    const experienceText = experienceMatch[1];
    const experiences = experienceText.split(/(?=\d{4}-(?:\d{4}|Present))/);
    cv.experience = experiences.map(exp => {
      const periodMatch = exp.match(/(\d{4}-(?:\d{4}|Present))/);
      const companyPositionMatch = exp.match(/([^|]+)\|\s*([^|]+?)(?=\d{4}-|\s*•|$)/);

      if (periodMatch && companyPositionMatch) {
        const responsibilities = exp
          .split('\n')
          .filter(line => line.trim().startsWith('•'))
          .map(line => line.replace('•', '').trim());

        return {
          period: periodMatch[1].trim(),
          company: companyPositionMatch[1].trim(),
          position: companyPositionMatch[2].trim(),
          responsibilities
        };
      }
      return null;
    }).filter((exp): exp is NonNullable<typeof exp> => exp !== null);
  }

  return cv;
}
