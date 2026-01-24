export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface WorkAchievement {
  id: string;
  content: string;
  order_by?: number;
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  timeframe: string;
  achievements: WorkAchievement[];
}

export interface Study {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
}

export interface TechTag {
  id?: string;
  name: string;
  icon?: string;
  order_by?: number;
}

export interface TechnicalSkill {
  id: string;
  title: string;
  description?: string;
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
