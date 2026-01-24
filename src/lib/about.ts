import { getApiUrl } from "./config/backend";

export interface AboutProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar_url: string;
}

export interface AboutResponse {
  status: boolean;
  message: string;
  data: {
    about: AboutProfile;
  };
}

export interface UpdateAboutRequest {
  name: string;
  role: string;
  description: string;
}

export interface UpdateAvatarResponse {
  status: boolean;
  message: string;
  data: {
    about: {
      avatar_url: string;
    };
  };
}

/**
 * Fetch basic about profile
 */
export async function fetchAbout(): Promise<AboutProfile | null> {
  try {
    const response = await fetch(getApiUrl("/about"));

    if (!response.ok) return null;

    const body: AboutResponse = await response.json();
    return body.data.about;
  } catch (error) {
    console.error("Failed to fetch about:", error);
    return null;
  }
}

/**
 * Update text-based profile
 */
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

/**
 * Update avatar image
 */
export async function updateAvatar(token: string, file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(getApiUrl("/about/avatar"), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) return null;

    const body: UpdateAvatarResponse = await response.json();
    return body.data.about.avatar_url;
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    return null;
  }
}
