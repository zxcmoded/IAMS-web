/**
 * Transport-level API shapes — finalized against the backend contract.
 */

/**
 * List query parameters (UI-side). `pageIndex` is 0-BASED here (Material
 * paginator); the API uses 1-based `page`, so each entity's API service maps
 * `page = pageIndex + 1` (and back). Parent filters are optional and used by
 * the hierarchical entities.
 */
export interface ListQuery {
  /** Case-insensitive substring on Name (and Code for L/W/R/B). */
  search?: string;
  /** Zero-based page index (UI). Mapped to 1-based `page` on the wire. */
  pageIndex?: number;
  /** Page size (contract default 25, max 200). */
  pageSize?: number;
  /** Include soft-deleted (isActive=false) records. Contract default false. */
  includeInactive?: boolean;
  /** Parent company filter (Locations; optional narrowing on deeper entities). */
  companyId?: string;
  /** Immediate-parent code filter (Warehouses/Racks/Bins). */
  parentCode?: string;
}

/**
 * The admin list envelope returned by every list endpoint.
 * `page` is 1-based (wire); the store converts to 0-based `pageIndex`.
 */
export interface AdminPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Normalized error surfaced to the UI, derived from the RFC7807 body
 * `{ type, title, status, detail, code, errors? }`. Effects map raw
 * HttpErrorResponse into this shape; `code` carries the machine-readable code
 * (e.g. `invalid_credentials`, `code_conflict`, `validation_failed`).
 */
export interface ApiError {
  status: number;
  message: string;
  /** Machine-readable error code from the RFC7807 `code` field. */
  code?: string;
  /** Field-level validation errors (field name → messages) on 400s. */
  fieldErrors?: Record<string, string[]>;
  /**
   * Invalid location codes echoed back by a `validation_failed` 400 when
   * assigning/creating a mobile user with codes that don't exist in the target
   * company. Carried as a TOP-LEVEL RFC7807 extension member (sibling of
   * `code`), not under `errors`.
   */
  invalidLocationCodes?: string[];
}
