export interface CVExperience {
    company: string;
    position: string;
    period: string;
    responsibilities: string[];
  }
  
  export interface ParsedCV {
    objective: string;
    skills: string[];
    experience: CVExperience[];
    summary?: string;
    education: string[];
  }