import { useAuthStore } from "@/store/auth";
import { getApiUrl } from "./config/backend";

/**
 * Standard API Client with automatic token refresh
 */
export async function apiClient(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken, refresh } = useAuthStore.getState();

  const url = getApiUrl(endpoint);
  const headers = new Headers(options.headers || {});

  // 1. Inject Authorization header if token exists
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  // 2. Perform original request
  let response = await fetch(url, fetchOptions);

  // 3. Handle 401 Unauthorized (Expired Token)
  if (response.status === 401) {
    const body = await response
      .clone()
      .json()
      .catch(() => ({}));

    // Check if it's specifically an "expired" error from Go backend
    if (body.message === "Invalid or expired token") {
      // Trigger refresh
      const success = await refresh();

      if (success) {
        // Retry with new token
        const newToken = useAuthStore.getState().accessToken;
        if (newToken) {
          headers.set("Authorization", `Bearer ${newToken}`);
          response = await fetch(url, fetchOptions);
        }
      }
    }
  }

  return response;
}
