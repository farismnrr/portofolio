/**
 * Authentication utility functions for SSO integration
 */

/**
 * Get access token from session storage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token");
}

/**
 * Set access token in session storage
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("access_token", token);
}

/**
 * Clear access token from session storage
 */
export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("access_token");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
