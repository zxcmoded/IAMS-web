/**
 * Production environment.
 *
 * `apiBaseUrl` is the API ORIGIN only (scheme + host + optional port) — do NOT
 * include a trailing slash and do NOT include the `/api` segment. All endpoint
 * paths are composed centrally in `core/api/api-endpoints.ts` as
 * `${apiBaseUrl}/api/...`, so swapping the real backend origin is a one-line
 * change here.
 */
export const environment = {
  production: true,
  /** TODO(contract): replace with the real deployed API origin. */
  apiBaseUrl: 'https://giso-test-web-amcthegjdmgaemgw.southeastasia-01.azurewebsites.net',
} as const;
