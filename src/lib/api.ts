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
    // Attempt to refresh
    const success = await refresh();

    if (success) {
      // Retry with new token
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        // Clone headers and update Auth
        const retryHeaders = new Headers(headers);
        retryHeaders.set("Authorization", `Bearer ${newToken}`);

        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      }
    }
  }

  return response;
}
