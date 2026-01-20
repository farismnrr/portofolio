/**
 * Centralized backend API URL configuration
 */

import { getAppConfig } from "./env";

export function getBackendUrl(): string {
  return getAppConfig().backendUrl;
}

/**
 * Get full API endpoint URL
 * Auth endpoints use Next.js API routes as proxy to avoid CORS
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Auth endpoints go through Next.js API proxy (same-origin)
  if (cleanEndpoint.startsWith("/auth/")) {
    return `/api${cleanEndpoint}`;
  }

  // Other endpoints call backend directly
  const backendUrl = getBackendUrl();
  return `${backendUrl}/v1${cleanEndpoint}`;
}
