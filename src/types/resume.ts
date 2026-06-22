export interface PersonalInfo {
  full_name: string;
  professional_title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  birth_info?: string;
  nationality?: string;
  hobbies?: string;
  photo_base64?: string;
  power_statement?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Project {
  name: string;
  role?: string;
  link?: string;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface ResumeData {
  personal_info: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillGroup[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  accomplishments: string[];
}

export interface Suggestion {
  title: string;
  reason: string;
  section: string;
  index?: number;
  key?: string;
  bullet_index?: number;
  original: string;
  suggested: string;
}

export type TemplateName =
  | "dublin"
  | "stockholm"
  | "toronto"
  | "london"
  | "sydney"
  | "berlin"
  | "tokyo"
  | "newyork"
  | "paris"
  | "melbourne"
  | "kolkata"
  | "delhi"
  | "bangalore"
  | "mumbai";

export const emptyResume: ResumeData = {
  personal_info: {
    full_name: "",
    professional_title: "",
    email: "",
    phone: "",
    location: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  accomplishments: [],
};
