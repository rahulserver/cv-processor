import { OpenAI } from 'openai';

interface ProcessedCV {
  firstName: string;
  objective: string;
  skills: { [category: string]: string };
  experience: {
    company: string;
    position: string;
    period: string;
    responsibilities: string[];
  }[];
  education: {
    institution: string;
    qualification: string;
    completionDate: string;
  }[];
  formattingNotes: string[];
  piiRemoved?: string[];
  recruiterDetails?: string;
}

export async function processCVWithAI(cvText: string): Promise<ProcessedCV> {
  console.log('cvText', cvText);

  // Add input validation at the start
  if (!cvText || !cvText.trim()) {
    throw new Error('Text is required');
  }

  console.log('Starting CV processing...');
  const startTime = Date.now();
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Initial analysis to determine strategy
    console.log('Starting strategy analysis...');
    const strategyStartTime = Date.now();
    const strategy = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an intelligent CV analyzer. Evaluate the CV and determine the optimal processing strategy.
          Return a JSON object describing what aspects need focus and in what order.`
        },
        {
          role: "user",
          content: `Analyze this CV and return a JSON object containing:
          {
            "contentQuality": "high|medium|low",
            "primaryFocus": ["List of areas needing most attention"],
            "processingPriorities": ["Ordered list of processing steps needed"],
            "potentialChallenges": ["Anticipated processing challenges"]
          }

          CV Content:
          ${cvText}`
        }
      ],
      response_format: { type: "json_object" }
    });
    console.log(`Strategy analysis completed in ${(Date.now() - strategyStartTime)/1000}s`);

    const strategyResult = JSON.parse(strategy.choices[0].message.content || '{}');

    // Main processing with strategy-informed approach
    console.log('Starting main processing...');
    const processingStartTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an intelligent CV processing agent. Your primary task is to ONLY process and format existing information, never invent new details.

          STRICT RULES:
          1. NEVER add education unless explicitly stated in the CV
          2. NEVER create certifications unless explicitly listed
          3. NEVER add references
          4. NEVER add percentages or specific metrics unless they appear in the source
          5. NEVER embellish or enhance responsibilities with metrics
          6. Track ALL removed PII in piiRemoved array, including:
             - Last names
             - Full names of references
             - Phone numbers
             - Email addresses
             - Physical addresses
             - Any other identifying information except first name

          SKILLS FORMATTING:
          1. Group similar skills under appropriate categories
          2. Return skills as an object where:
             - Keys are category names (derived from the skills present)
             - Values are comma-separated strings of related skills
          3. DO NOT create categories that don't match the skills present
          4. DO NOT invent or add skills not present in the source

          Example skills format (DO NOT USE THESE EXACT CATEGORIES, CREATE RELEVANT ONES FROM THE CV):
          {
            "Category Name": "skill1, skill2, skill3",
            "Another Category": "skill4, skill5, skill6"
          }

          Return the processed CV in this exact format:
          {
            "firstName": "string",
            "objective": "string",
            "skills": {
              "category1": "comma separated skills",
              "category2": "comma separated skills"
            },
            "experience": [{
              "company": "string",
              "position": "string",
              "period": "string",
              "responsibilities": ["string"]
            }],
            "education": [{
              "institution": "string",
              "qualification": "string",
              "completionDate": "string"
            }],
            "formattingNotes": ["string"],
            "piiRemoved": ["string"]
          }`
        },
        {
          role: "user",
          content: `Process this CV and return a JSON object following the specified format:

          CV Content:
          ${cvText}`
        }
      ],
      response_format: { type: "json_object" }
    });
    console.log(`Main processing completed in ${(Date.now() - processingStartTime)/1000}s`);

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Enhancement if needed
    if (strategyResult.contentQuality !== 'high' || strategyResult.potentialChallenges.length > 0) {
      console.log('Starting enhancement...');
      const enhancementStartTime = Date.now();
      const enhancement = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a CV enhancement specialist. Your task is to improve the organization and presentation of the CV while maintaining factual accuracy.

            STRICT RULES:
            1. NEVER add information that isn't in the source CV
            2. NEVER create metrics or percentages that aren't in the source
            3. NEVER fabricate any details
            
            SKILLS ORGANIZATION:
            1. Analyze the skills list and identify 4-6 natural groupings based on the actual skills present
            2. Create appropriate category names based on the skills' nature
            3. Group related skills together under each category
            4. Format each category as "Category: skill1, skill2, etc."
            
            Example format (DO NOT USE THESE EXACT CATEGORIES, CREATE RELEVANT ONES BASED ON THE CV):
            "Core Technical Skills: skill1, skill2, skill3"
            "Tools & Systems: skill1, skill2"
            "Process & Methods: skill1, skill2"
            
            The categories should emerge from the skills present in the CV, not from a predefined list.`
          },
          {
            role: "user",
            content: `Enhance this CV by organizing the skills into natural groupings while maintaining all other sections as they are.
            
            Current CV:
            ${JSON.stringify(result)}
            
            Return an improved version in the same JSON format, with skills grouped but not fabricated.`
          }
        ],
        response_format: { type: "json_object" }
      });
      console.log(`Enhancement completed in ${(Date.now() - enhancementStartTime)/1000}s`);

      const enhancedResult = JSON.parse(enhancement.choices[0].message.content || '{}');
      console.log(`Total processing time: ${(Date.now() - startTime)/1000}s`);
      console.log('enhancedResult',JSON.stringify(enhancedResult));
      return enhancedResult;
    }

    console.log(`Total processing time: ${(Date.now() - startTime)/1000}s`);
    console.log('result',JSON.stringify(result));
    return result;

  } catch (error) {
    console.error('Error processing CV:', error);
    console.log(`Failed after ${(Date.now() - startTime)/1000}s`);
    throw new Error('Failed to process CV');
  }
}