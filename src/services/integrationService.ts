import apiClient from './AxiosService';

export interface IntegrationInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

let cache: IntegrationInfo[] | null = null;
let inFlight: Promise<IntegrationInfo[]> | null = null;

/**
 * Fetch a lean list of integrations (id, name, description, icon) with request-level caching.
 * – First caller triggers the network request.
 * – Concurrent callers await the same promise (so only ONE request is ever in-flight).
 * – Subsequent callers receive the resolved cache synchronously.
 */
export async function getLeanIntegrations(): Promise<IntegrationInfo[]> {
  if (cache) return cache;

  if (inFlight) return inFlight;

  inFlight = apiClient
    .get<IntegrationInfo[]>('/integrations/discover/lean?fields=id,name,description,icon')
    .then((res) => {
      cache = res.data;
      return cache;
    })
    .finally(() => {
      // Clear inFlight so future cache refreshes (if desired) are possible
      inFlight = null;
    });

  return inFlight;
}
