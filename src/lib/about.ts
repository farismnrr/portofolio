import { getApiUrl } from "./config/backend";

// --- COMMON TYPES ---

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// --- PROFILE ---

export interface AboutProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar_url: string;
}

export interface UpdateAboutRequest {
  name: string;
  role: string;
  description: string;
}

// --- SOCIAL LINKS ---

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  order_by: number;
}

// --- WORK EXPERIENCE ---

export interface WorkAchievement {
  id: string;
  content: string;
  order_by: number;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  timeframe: string;
  achievements: WorkAchievement[];
}

// --- EDUCATION ---

export interface Education {
  id: string;
  institution: string;
  degree: string;
  period: string;
  description: string;
}

// --- SKILLS ---

export interface SkillTag {
  id: string;
  name: string;
  icon: string;
  order_by: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  order_by: number;
  tags: SkillTag[];
}

// --- API FUNCTIONS ---

/**
 * Profile APIs
 */
export async function fetchAbout(): Promise<AboutProfile | null> {
  try {
    const response = await fetch(getApiUrl("/about"));
    if (!response.ok) return null;
    const body: ApiResponse<{ about: AboutProfile }> = await response.json();
    return body.data.about;
  } catch (error) {
    console.error("Failed to fetch about:", error);
    return null;
  }
}

export async function updateAbout(token: string, data: UpdateAboutRequest): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl("/about"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to update about:", error);
    return false;
  }
}

export async function updateAvatar(token: string, file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await fetch(getApiUrl("/about/avatar"), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) return null;
    const body: ApiResponse<{ about: { avatar_url: string } }> = await response.json();
    return body.data.about.avatar_url;
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    return null;
  }
}

/**
 * Social Links APIs
 */
export async function fetchSocialLinks(): Promise<SocialLink[]> {
  try {
    const response = await fetch(getApiUrl("/about/social-links"));
    if (!response.ok) return [];
    const body: ApiResponse<{ social_links: SocialLink[] }> = await response.json();
    return body.data.social_links || [];
  } catch (error) {
    console.error("Failed to fetch social links:", error);
    return [];
  }
}

export async function createSocialLink(token: string, data: Partial<SocialLink>): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl("/about/social-links"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (_error) {
    return false;
  }
}

export async function updateSocialLink(
  token: string,
  id: string,
  data: Partial<SocialLink>,
): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl(`/about/social-links/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (_error) {
    return false;
  }
}

export async function deleteSocialLink(token: string, id: string): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl(`/about/social-links/${id}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (_error) {
    return false;
  }
}

/**
 * Work Experience APIs
 */
export async function fetchWorkExperiences(): Promise<WorkExperience[]> {
  try {
    const response = await fetch(getApiUrl("/about/work-experiences"));
    if (!response.ok) return [];
    const body: ApiResponse<{ work_experiences: WorkExperience[] }> = await response.json();
    return body.data.work_experiences || [];
  } catch (_error) {
    return [];
  }
}

export async function createWorkExperience(
  token: string,
  data: Partial<WorkExperience>,
): Promise<boolean> {
  const response = await fetch(getApiUrl("/about/work-experiences"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return response.ok;
}

export async function deleteWorkExperience(token: string, id: string): Promise<boolean> {
  const response = await fetch(getApiUrl(`/about/work-experiences/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.ok;
}

/**
 * Education APIs
 */
export async function fetchEducations(): Promise<Education[]> {
  try {
    const response = await fetch(getApiUrl("/about/education"));
    if (!response.ok) return [];
    const body: ApiResponse<{ education: Education[] }> = await response.json();
    return body.data.education || [];
  } catch (_error) {
    return [];
  }
}

export async function createEducation(token: string, data: Partial<Education>): Promise<boolean> {
  const response = await fetch(getApiUrl("/about/education"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return response.ok;
}

export async function deleteEducation(token: string, id: string): Promise<boolean> {
  const response = await fetch(getApiUrl(`/about/education/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.ok;
}

/**
 * Skills APIs
 */
export async function fetchSkills(): Promise<SkillCategory[]> {
  try {
    const response = await fetch(getApiUrl("/about/skills"));
    if (!response.ok) return [];
    const body: ApiResponse<{ skill_categories: SkillCategory[] }> = await response.json();
    return body.data.skill_categories || [];
  } catch (_error) {
    return [];
  }
}

export async function createSkillCategory(
  token: string,
  data: Partial<SkillCategory>,
): Promise<boolean> {
  const response = await fetch(getApiUrl("/about/skills"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return response.ok;
}

export async function deleteSkillCategory(token: string, id: string): Promise<boolean> {
  const response = await fetch(getApiUrl(`/about/skills/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.ok;
}
