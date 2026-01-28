export interface SocialLink {
  name: string;
  icon: string;
  link: string;
  essential?: boolean;
  // order_by is not in markdown, but was used in legacy code.
  // We will remove the sort logic in page.tsx as markdown list order is sufficient.
}

export interface AboutProfile {
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  location: string;
  languages: string[];
  social: SocialLink[];
  description: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  timeframe: string;
  order: number;
  achievements: string[];
  description?: string; // Optional, though usually we expect empty if usage is from achievements
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  order: number;
  description: string;
}

export interface SkillTag {
  name: string;
  icon: string;
}

export interface SkillCategory {
  title: string;
  order: number;
  tags: SkillTag[];
  description: string;
}
