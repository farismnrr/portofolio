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
  const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!ssoUrl) throw new Error("NEXT_PUBLIC_SSO_URL must be configured");
  if (!apiKey) throw new Error("NEXT_PUBLIC_API_KEY must be configured");
  if (!tenantId) throw new Error("NEXT_PUBLIC_TENANT_ID must be configured");
  if (!backendUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL must be configured");

  return {
    ssoUrl,
    apiKey,
    tenantId,
    backendUrl,
  };
}
