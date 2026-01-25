import { apiClient } from "./api";

// --- COMMON TYPES ---

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface MutationResult {
  success: boolean;
  message?: string;
  errors?: { field: string; message: string }[];
}

// --- PROFILE ---

export interface AboutProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

export interface UpdateAboutRequest {
  name: string;
  role: string;
  description: string;
  avatar: string;
}

// --- SOCIAL LINKS ---

export interface SocialLink {
  id: string;
  name: string;
  link: string;
  icon: string;
  order_by: number;
}

// --- WORK EXPERIENCE ---

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  timeframe: string;
  description: string;
  order_by: number;
}

// --- EDUCATION ---

export interface Education {
  id: string;
  institution: string;
  degree: string;
  period: string;
  description: string;
  order_by: number;
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
  description: string;
  order_by: number;
  tags: SkillTag[];
}

// --- API FUNCTIONS ---

/**
 * Profile APIs
 */
export async function fetchAbout(): Promise<AboutProfile | null> {
  try {
    const response = await apiClient("/about");
    if (!response.ok) return null;
    const body: ApiResponse<{ about: AboutProfile }> = await response.json();
    return body.data.about;
  } catch (error) {
    console.error("Failed to fetch about:", error);
    return null;
  }
}

export async function updateAbout(
  _token: string,
  data: UpdateAboutRequest,
): Promise<MutationResult> {
  try {
    const response = await apiClient("/about", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) return { success: true };

    const body = await response.json();
    return {
      success: false,
      message: body.message,
      errors: body.details,
    };
  } catch (error) {
    console.error("Failed to update about:", error);
    return { success: false, message: "Network error" };
  }
}

export async function updateAvatar(_token: string, file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiClient("/about/avatar", {
      method: "PATCH",
      body: formData,
    });
    if (!response.ok) return null;
    const body: ApiResponse<{ about: { avatar: string } }> = await response.json();
    return body.data.about.avatar;
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
    const response = await apiClient("/about/social-links");
    if (!response.ok) return [];
    const body: ApiResponse<{ social_links: SocialLink[] }> = await response.json();
    return body.data.social_links || [];
  } catch (error) {
    console.error("Failed to fetch social links:", error);
    return [];
  }
}

export async function createSocialLink(
  _token: string,
  data: Partial<SocialLink>,
): Promise<MutationResult> {
  try {
    const response = await apiClient("/about/social-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) return { success: true };

    const body = await response.json();
    return { success: false, message: body.message, errors: body.details };
  } catch (_error) {
    return { success: false, message: "Network error" };
  }
}

export async function updateSocialLink(
  _token: string,
  id: string,
  data: Partial<SocialLink>,
): Promise<MutationResult> {
  try {
    const response = await apiClient(`/about/social-links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) return { success: true };

    const body = await response.json();
    return { success: false, message: body.message, errors: body.details };
  } catch (_error) {
    return { success: false, message: "Network error" };
  }
}

export async function deleteSocialLink(_token: string, id: string): Promise<boolean> {
  try {
    const response = await apiClient(`/about/social-links/${id}`, {
      method: "DELETE",
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
    const response = await apiClient("/about/work-experiences");
    if (!response.ok) return [];
    const body: ApiResponse<{ work_experiences: WorkExperience[] }> = await response.json();
    return body.data.work_experiences || [];
  } catch (_error) {
    return [];
  }
}

export async function createWorkExperience(
  _token: string,
  data: Partial<WorkExperience>,
): Promise<MutationResult> {
  const response = await apiClient("/about/work-experiences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) return { success: true };

  const body = await response.json();
  return { success: false, message: body.message, errors: body.details };
}

export async function updateWorkExperience(
  _token: string,
  id: string,
  data: Partial<WorkExperience>,
): Promise<MutationResult> {
  const response = await apiClient(`/about/work-experiences/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) return { success: true };

  const body = await response.json();
  return { success: false, message: body.message, errors: body.details };
}

export async function deleteWorkExperience(_token: string, id: string): Promise<boolean> {
  const response = await apiClient(`/about/work-experiences/${id}`, {
    method: "DELETE",
  });
  return response.ok;
}

/**
 * Education APIs
 */
export async function fetchEducations(): Promise<Education[]> {
  try {
    const response = await apiClient("/about/education");
    if (!response.ok) return [];
    const body: ApiResponse<{ educations: Education[] }> = await response.json();
    return body.data.educations || [];
  } catch (_error) {
    return [];
  }
}

export async function createEducation(
  _token: string,
  data: Partial<Education>,
): Promise<MutationResult> {
  const response = await apiClient("/about/education", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) return { success: true };

  const body = await response.json();
  return { success: false, message: body.message, errors: body.details };
}

export async function updateEducation(
  _token: string,
  id: string,
  data: Partial<Education>,
): Promise<MutationResult> {
  const response = await apiClient(`/about/education/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) return { success: true };

  const body = await response.json();
  return { success: false, message: body.message, errors: body.details };
}

export async function deleteEducation(_token: string, id: string): Promise<boolean> {
  const response = await apiClient(`/about/education/${id}`, {
    method: "DELETE",
  });
  return response.ok;
}

/**
 * Skills APIs
 */
export async function fetchSkills(): Promise<SkillCategory[]> {
  try {
    const response = await apiClient("/about/skills");
    if (!response.ok) return [];
    const body: ApiResponse<{ skill_categories: SkillCategory[] }> = await response.json();
    return body.data.skill_categories || [];
  } catch (_error) {
    return [];
  }
}

export async function createSkillCategory(
  _token: string,
  data: Partial<SkillCategory>,
): Promise<MutationResult> {
  const response = await apiClient("/about/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) return { success: true };

  const body = await response.json();
  return { success: false, message: body.message, errors: body.details };
}

export async function updateSkillCategory(
  _token: string,
  id: string,
  data: Partial<SkillCategory>,
): Promise<MutationResult> {
  const response = await apiClient(`/about/skills/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) return { success: true };

  const body = await response.json();
  return { success: false, message: body.message, errors: body.details };
}

export async function deleteSkillCategory(_token: string, id: string): Promise<boolean> {
  const response = await apiClient(`/about/skills/${id}`, {
    method: "DELETE",
  });
  return response.ok;
}
