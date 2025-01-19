import { OpenAI } from 'openai';
import { ParsedCV } from '../pdf/types';

// Move initialization into a function to make it easier to mock
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function processCVWithAI(cvText: string): Promise<ParsedCV> {
  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a CV parsing expert. Extract structured information from CVs in a consistent format. 
          Focus on: career objective, key skills, work experience (including company, position, period, and responsibilities), and education.
          Maintain professionalism and handle various CV formats intelligently.`
        },
        {
          role: "user",
          content: `Parse this CV and return a JSON object with the following structure:
          {
            "objective": "string",
            "skills": ["string"],
            "experience": [{
              "company": "string",
              "position": "string",
              "period": "string",
              "responsibilities": ["string"]
            }],
            "education": ["string"]
          }
          
          CV Content:
          ${cvText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    if (!completion.choices[0].message.content) {
      throw new Error('No content in AI response');
    }

    const result = JSON.parse(completion.choices[0].message.content);
    return result as ParsedCV;
  } catch (error) {
    console.error('Error processing CV with AI:', error);
    throw new Error('Failed to process CV with AI');
  }
}