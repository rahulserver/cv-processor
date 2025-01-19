export interface CVExperience {
    company: string;
    position: string;
    period: string;
    responsibilities: string[];
  }
  
  export interface ParsedCV {
    objective: string;
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      period: string;
      responsibilities: string[];
    }>;
    education: string[];
    formattingNotes?: string[];
    originalNames?: string[];
    piiRemoved?: string[];
  }
  
  export interface CVProcessingError {
    message: string;
    code: string;
  }
  
  export interface ProcessedCVResponse {
    success: boolean;
    data?: ParsedCV;
    error?: CVProcessingError;
  }