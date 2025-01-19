import PDFParser from 'pdf2json';
import { ParsedCV } from './types';

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', (errMsg: Record<"parserError", Error>) => {
      reject(new Error(`Error parsing PDF: ${errMsg.parserError.message}`));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        const text = pdfData.Pages
          .map((page: any) => 
            page.Texts
              .map((textItem: any) => decodeURIComponent(textItem.R[0].T))
              .join(' ')
          )
          .join('\n');
        resolve(text);
      } catch (error) {
        reject(new Error(`Error processing PDF data: ${error}`));
      }
    });

    pdfParser.parseBuffer(pdfBuffer);
  });
}

export function parseCV(text: string): ParsedCV {
  const cv: ParsedCV = {
    objective: '',
    skills: [],
    experience: [],
    education: []
  };

  // Parse career objective
  const objectiveMatch = text.match(/CAREER OBJECTIVE[:\s]+(.*?)(?=KEY SKILLS|$)/si);
  if (objectiveMatch) {
    cv.objective = objectiveMatch[1].trim();
  }

  // Parse key skills
  const skillsMatch = text.match(/KEY SKILLS[:\s]+(.*?)(?=WORK HISTORY|$)/si);
  if (skillsMatch) {
    cv.skills = skillsMatch[1]
      .split(/[•\n]/) // Split by bullet points or newlines
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }

  // Parse work experience
  const experienceMatch = text.match(/WORK HISTORY[:\s]+(.*?)(?=EDUCATION|$)/si);
  if (experienceMatch) {
    const experienceText = experienceMatch[1];
    const experiences = experienceText.split(/(?=\d{4}-\d{4}|Present)/gi);
    
    cv.experience = experiences
      .map(exp => {
        const periodMatch = exp.match(/(\d{4}-(?:\d{4}|Present))/i);
        const companyMatch = exp.match(/at\s+([^,\n]+)/i);
        const positionMatch = exp.match(/(?:as|position:)\s+([^,\n]+)/i);
        
        if (periodMatch && (companyMatch || positionMatch)) {
          return {
            period: periodMatch[1],
            company: companyMatch ? companyMatch[1].trim() : '',
            position: positionMatch ? positionMatch[1].trim() : '',
          };
        }
        return null;
      })
      .filter((exp): exp is NonNullable<typeof exp> => exp !== null);
  }

  return cv;
}
