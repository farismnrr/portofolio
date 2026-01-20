/**
 * Centralized backend API URL configuration
 */

export function getBackendUrl(): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    // Default to localhost in development
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:8080";
    }
    throw new Error("NEXT_PUBLIC_BACKEND_URL must be configured in production");
  }

  return backendUrl;
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
