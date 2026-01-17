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

/**
 * Get user role from access token
 */
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role: string | null;
}

export function getUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role || null;
  } catch (error) {
    return null;
  }
}
