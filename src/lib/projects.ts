export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  og_image: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string;
  project_name: string;
  images: string[];
  link: string;
  repository: string;
  team: TeamMember[];
  published_at: string;
  seo_metadata?: SEOMetadata;
  views_count: number;
  likes_count: number;
}

import { getApiUrl } from "@/lib/config/backend";

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(getApiUrl("/interactions/works"), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const result = await response.json();
  return result.data.map((p: Project) => ({
    ...p,
    images: p.images ? JSON.parse(p.images as unknown as string) : [],
    team: p.team ? JSON.parse(p.team as unknown as string) : [],
  }));
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  const response = await fetch(getApiUrl(`/interactions/works/${slug}`), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Project not found");
  }

  const result = await response.json();
  const p = result.data;
  return {
    ...p,
    images: p.images ? JSON.parse(p.images) : [],
    team: p.team ? JSON.parse(p.team) : [],
  };
}

export async function createProject(project: Partial<Project>, token: string): Promise<Project> {
  const response = await fetch(getApiUrl("/interactions/works"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...project,
      images: JSON.stringify(project.images || []),
      team: JSON.stringify(project.team || []),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create project");
  }

  const result = await response.json();
  return result.data;
}

export async function updateProject(
  id: string,
  project: Partial<Project>,
  token: string,
): Promise<Project> {
  const response = await fetch(getApiUrl(`/interactions/works/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...project,
      images: JSON.stringify(project.images || []),
      team: JSON.stringify(project.team || []),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update project");
  }

  const result = await response.json();
  return result.data;
}

export async function deleteProject(id: string, token: string): Promise<void> {
  const response = await fetch(getApiUrl(`/interactions/works/${id}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete project");
  }
}
