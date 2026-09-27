export interface SocialLink {
  name: string;
  icon: string;
  link: string;
  essential?: boolean;
}

export interface AboutContent {
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
  descriptionHtml: string;
}

export interface WorkItem {
  company: string;
  role: string;
  timeframe: string;
  order: number;
  achievements: string[];
}

export interface StudyItem {
  institution: string;
  degree: string;
  period: string;
  order: number;
  description: string;
  descriptionHtml: string;
}

export interface SkillItem {
  title: string;
  order: number;
  tags: Array<{ name: string; icon?: string }>;
  description: string;
  descriptionHtml: string;
}

export interface ProjectMember {
  name: string;
  role?: string;
  avatar: string;
  linkedIn?: string;
}

export interface Project {
  slug: string;
  title: string;
  projectName: string;
  publishedAt: string;
  summary: string;
  order: number;
  images: string[];
  link: string;
  repository: string;
  tags: string[];
  team: ProjectMember[];
  body: string;
  html: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  image: string;
  tags: string[];
  body: string;
  html: string;
}

export interface Certification {
  group: string;
  title: string;
  image: string;
  pdf: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}
