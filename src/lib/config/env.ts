/**
 * Centralized environment variable access for SSO
 */

export interface SsoConfig {
  url: string;
  apiKey: string;
  tenantId: string;
}

/**
 * Validates and returns the SSO configuration.
 * Throws an error if any required environment variable is missing.
 */
export function getSsoConfig(): SsoConfig {
  const url = process.env.NEXT_PUBLIC_SSO_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SSO_URL must be configured");
  }
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_API_KEY must be configured");
  }
  if (!tenantId) {
    throw new Error("NEXT_PUBLIC_TENANT_ID must be configured");
  }

  return {
    url,
    apiKey,
    tenantId,
  };
}
