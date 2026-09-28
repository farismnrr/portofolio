/// <reference types="vite/client" />

interface Window {
  __PORTFOLIO_RUNTIME__?: {
    agentationEnabled?: boolean;
  };
}

declare module "virtual:content/about" {
  import type { AboutContent } from "./content/types";

  const content: AboutContent;
  export default content;
}
declare module "virtual:content/work" {
  import type { WorkItem } from "./content/types";

  const content: WorkItem[];
  export default content;
}
declare module "virtual:content/studies" {
  import type { StudyItem } from "./content/types";

  const content: StudyItem[];
  export default content;
}
declare module "virtual:content/skills" {
  import type { SkillItem } from "./content/types";

  const content: SkillItem[];
  export default content;
}
declare module "virtual:content/projects" {
  import type { Project } from "./content/types";

  const content: Project[];
  export default content;
}
declare module "virtual:content/blog" {
  import type { BlogPost } from "./content/types";

  const content: BlogPost[];
  export default content;
}
declare module "virtual:content/certifications" {
  import type { Certification } from "./content/types";

  const content: Certification[];
  export default content;
}
declare module "virtual:content/gallery" {
  import type { GalleryImage } from "./content/types";

  const content: GalleryImage[];
  export default content;
}
