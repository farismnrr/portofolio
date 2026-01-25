export interface Link {
  id: string;
  label: string;
  url: string;
  icon: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Study {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
}

export interface TechTag {
  name: string;
  icon?: string;
}

export interface TechnicalSkill {
  id: string;
  title: string;
  description: string;
  tags: TechTag[];
}

export interface AboutData {
  photo: string;
  name: string;
  title: string;
  description: string;
  links: Link[];
  workExperience: WorkExperience[];
  studies: Study[];
  technicalSkills: TechnicalSkill[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResponse {
  status: boolean;
  message: string;
  details: ValidationError[];
}
