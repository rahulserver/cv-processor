import { OpenAI } from 'openai';
import { ParsedCV } from '../pdf/types';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface AnonymizedCV extends ParsedCV {
  originalNames?: string[];
  piiRemoved?: string[];
}

export async function processCVWithAI(cvText: string): Promise<AnonymizedCV> {
  const openai = getOpenAIClient();

  try {
    // Step 1: Initial parsing and PII detection
    const piiAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert CV analyzer focusing on privacy and formatting. 
          Your task is to identify and handle personally identifiable information (PII) while maintaining essential professional content.`
        },
        {
          role: "user",
          content: `Analyze this CV for PII and return a JSON object containing:
          1. List of identified PII elements
          2. The same text with PII anonymized (keep first names only)
          3. List of original names found (for reference)
          
          Format the response as:
          {
            "piiFound": ["list", "of", "PII", "elements"],
            "anonymizedText": "CV text with PII removed",
            "originalNames": ["list", "of", "original", "names"]
          }
          
          CV Content:
          ${cvText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const piiResult = JSON.parse(piiAnalysis.choices[0].message.content || '{}');

    // Step 2: Structure the anonymized CV
    const structureCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a CV formatting expert. 
          Parse and structure the anonymized CV into a professional format following these guidelines:
          1. Maintain clear section headings (in title case)
          2. Use bullet points for skills and experiences
          3. Ensure consistent date formatting
          4. Keep formatting clean and professional
          5. Remove any remaining personal identifiers except first names`
        },
        {
          role: "user",
          content: `Parse this anonymized CV and return a JSON object with the following structure:
          {
            "objective": "A clear, professional summary",
            "skills": ["Array of key skills"],
            "experience": [{
              "company": "Company name",
              "position": "Job title",
              "period": "Date period",
              "responsibilities": ["Array of key responsibilities"]
            }],
            "education": ["Array of education entries"],
            "formattingNotes": ["Any special formatting instructions"]
          }

          Anonymized CV:
          ${piiResult.anonymizedText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const structuredResult = JSON.parse(structureCompletion.choices[0].message.content || '{}');

    // Combine results
    return {
      ...structuredResult,
      originalNames: piiResult.originalNames,
      piiRemoved: piiResult.piiFound
    };

  } catch (error) {
    console.error('Error processing CV with AI:', error);
    throw new Error('Failed to process CV with AI');
  }
}