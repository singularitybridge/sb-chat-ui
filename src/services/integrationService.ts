import apiClient from './AxiosService';

export interface IntegrationInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

let cache: IntegrationInfo[] | null = null;
let cacheLanguage: string | null = null;
let inFlight: Promise<IntegrationInfo[]> | null = null;

/**
 * Clear the integration cache. Call this when language changes
 * to ensure integrations are refetched with the new language.
 */
export function clearIntegrationCache(): void {
  cache = null;
  cacheLanguage = null;
  inFlight = null;
}

/**
 * Fetch a lean list of integrations (id, name, description, icon) with request-level caching.
 * – First caller triggers the network request.
 * – Concurrent callers await the same promise (so only ONE request is ever in-flight).
 * – Subsequent callers receive the resolved cache synchronously.
 * – Language parameter is passed to ensure axios cache uses separate entries per language.
 */
export async function getLeanIntegrations(): Promise<IntegrationInfo[]> {
  const currentLanguage = localStorage.getItem('appLanguage') || 'en';

  // Return cache only if it matches current language
  if (cache && cacheLanguage === currentLanguage) return cache;

  // Clear stale cache if language changed
  if (cacheLanguage !== currentLanguage) {
    cache = null;
    cacheLanguage = null;
  }

  if (inFlight) return inFlight;

  // Include language as query param to bust axios cache when language changes
  // Use cache: false to ensure fresh data on language change
  inFlight = apiClient
    .get<IntegrationInfo[]>(`/integrations/discover/lean?fields=id,name,description,icon&lang=${currentLanguage}`, {
      cache: false  // Disable axios-cache-interceptor for this request
    })
    .then((res) => {
      cache = res.data;
      cacheLanguage = currentLanguage;
      return cache;
    })
    .finally(() => {
      // Clear inFlight so future cache refreshes (if desired) are possible
      inFlight = null;
    });

  return inFlight;
}
