/**
 * Domain entity models for the IAMS hierarchy:
 *   Company -> Location -> Warehouse -> Rack -> Bin
 *
 * Field names mirror the API wire shape (camelCase). These shapes are listed as
 * STABLE by the Lead and are safe to model before the final contract lands.
 *
 * PK notes:
 *  - Company has a server-generated Guid `companyId` (no user-entered code).
 *  - Location/Warehouse/Rack/Bin use a user-entered, globally-unique `code` as
 *    the immutable PK (read-only on edit, required + unique on create).
 */

/** Fields present on every entity record. */
export interface AuditFields {
  readonly createdAtUtc: string;
  readonly updatedAtUtc?: string | null;
}

export interface Company extends AuditFields {
  readonly companyId: string; // Guid, PK, server-generated
  name: string;
  isActive: boolean;
}

export interface Location extends AuditFields {
  readonly code: string; // PK
  companyId: string; // parent
  name: string;
  isActive: boolean;
  region?: string | null;
}

export interface Warehouse extends AuditFields {
  readonly code: string; // PK
  locationCode: string; // parent
  companyId: string;
  name: string;
  isActive: boolean;
}

export interface Rack extends AuditFields {
  readonly code: string; // PK
  warehouseCode: string; // parent
  locationCode: string;
  companyId: string;
  name: string;
  isActive: boolean;
}

export interface Bin extends AuditFields {
  readonly code: string; // PK
  rackCode: string; // parent
  warehouseCode: string;
  locationCode: string;
  companyId: string;
  name: string;
  isActive: boolean;
}

export type AnyEntity = Company | Location | Warehouse | Rack | Bin;

/**
 * The entity key names. The Lead-confirmed hierarchy; used by features to label
 * routes and modules consistently.
 */
export type EntityKind = 'company' | 'location' | 'warehouse' | 'rack' | 'bin';
