export interface AppConfig {
  ssoUrl: string;
  apiKey: string;
  tenantId: string;
  backendUrl: string;
}

/**
 * Validates and returns the Application configuration.
 * Throws an error if any required environment variable is missing.
 */
export function getAppConfig(): AppConfig {
  const isServer = typeof window === "undefined";
  const runtimeConfig = !isServer
    ? (window as unknown as { config?: Record<string, string> }).config || {}
    : {};

  const ssoUrl = runtimeConfig.ssoUrl || process.env.NEXT_PUBLIC_SSO_URL;
  const apiKey = runtimeConfig.apiKey || process.env.NEXT_PUBLIC_API_KEY;
  const tenantId = runtimeConfig.tenantId || process.env.NEXT_PUBLIC_TENANT_ID;
  const backendUrl = runtimeConfig.backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!ssoUrl) throw new Error("SSO_URL must be configured");
  if (!apiKey) throw new Error("API_KEY must be configured");
  if (!tenantId) throw new Error("TENANT_ID must be configured");
  if (!backendUrl) throw new Error("BACKEND_URL must be configured");

  return {
    ssoUrl,
    apiKey,
    tenantId,
    backendUrl,
  };
}
