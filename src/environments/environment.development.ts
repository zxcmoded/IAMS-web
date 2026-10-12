/**
 * Development environment.
 *
 * `apiBaseUrl` is the API ORIGIN only (no trailing slash, no `/api`). Endpoint
 * paths are composed in `core/api/api-endpoints.ts`.
 */
export const environment = {
  production: false,
  /**
   * Backend local dev origin (confirmed by Team Lead). The backend also exposes
   * https://localhost:7217, but http avoids dev-cert friction. CORS on the
   * backend allows this app's origin http://localhost:4200.
   */
  apiBaseUrl: 'https://giso-test-web-amcthegjdmgaemgw.southeastasia-01.azurewebsites.net',
} as const;
