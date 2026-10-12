import { environment } from '../../../environments/environment';

/**
 * Single source of truth for every API URL in the app.
 *
 * CONTRACT-PENDING: these paths are best-effort placeholders following
 * conventional REST naming. The backend teammate owns the final routes; when
 * the Lead relays the contract, update ONLY this file (and the request/response
 * mapping in the relevant API service) — nothing else should hardcode a path.
 *
 * `apiBaseUrl` is the origin only; we append `/api/...` here.
 */

const root = `${environment.apiBaseUrl}/api`;

export const ApiEndpoints = {
  auth: {
    login: () => `${root}/auth/login`,
  },
  users: {
    list: () => `${root}/users`,
    byId: (id: string) => `${root}/users/${encodeURIComponent(id)}`,
    create: () => `${root}/users`,
    update: (id: string) => `${root}/users/${encodeURIComponent(id)}`,
  },
  company: {
    list: () => `${root}/companies`,
    byId: (id: string) => `${root}/companies/${encodeURIComponent(id)}`,
    create: () => `${root}/companies`,
    update: (id: string) => `${root}/companies/${encodeURIComponent(id)}`,
    remove: (id: string) => `${root}/companies/${encodeURIComponent(id)}`,
  },
  location: {
    list: () => `${root}/locations`,
    byId: (code: string) => `${root}/locations/${encodeURIComponent(code)}`,
    create: () => `${root}/locations`,
    update: (code: string) => `${root}/locations/${encodeURIComponent(code)}`,
    remove: (code: string) => `${root}/locations/${encodeURIComponent(code)}`,
  },
  warehouse: {
    list: () => `${root}/warehouses`,
    byId: (code: string) => `${root}/warehouses/${encodeURIComponent(code)}`,
    create: () => `${root}/warehouses`,
    update: (code: string) => `${root}/warehouses/${encodeURIComponent(code)}`,
    remove: (code: string) => `${root}/warehouses/${encodeURIComponent(code)}`,
  },
  rack: {
    list: () => `${root}/racks`,
    byId: (code: string) => `${root}/racks/${encodeURIComponent(code)}`,
    create: () => `${root}/racks`,
    update: (code: string) => `${root}/racks/${encodeURIComponent(code)}`,
    remove: (code: string) => `${root}/racks/${encodeURIComponent(code)}`,
  },
  bin: {
    list: () => `${root}/bins`,
    byId: (code: string) => `${root}/bins/${encodeURIComponent(code)}`,
    create: () => `${root}/bins`,
    update: (code: string) => `${root}/bins/${encodeURIComponent(code)}`,
    remove: (code: string) => `${root}/bins/${encodeURIComponent(code)}`,
  },
} as const;
