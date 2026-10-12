/**
 * Role codes as defined by the backend. Higher code = more privilege.
 * These numeric codes are stable domain facts and are safe to model now.
 */
export enum RoleCode {
  Viewer = 100,
  User = 200,
  Manager = 300,
  Admin = 700,
  SuperAdmin = 800,
}

/**
 * Minimum role code allowed into the portal.
 *
 * Product decision: ANY valid authenticated role may sign in — per-page CRUD is
 * still gated to Admin+ in the UI for now, and a proper RBAC policy is future
 * work. The floor is therefore the lowest defined role (Viewer), so the gate
 * only rejects a session with no/invalid role, not an under-privileged one.
 */
export const MIN_PORTAL_ROLE_CODE = RoleCode.Viewer; // 100

/** True when the given role code belongs to a valid (admittable) user. */
export function canAccessPortal(roleCode: number | null | undefined): boolean {
  return typeof roleCode === 'number' && roleCode >= MIN_PORTAL_ROLE_CODE;
}

/** Human-friendly label for a role code (best-effort; unknown codes echo the number). */
export function roleLabel(roleCode: number | null | undefined): string {
  if (roleCode == null) {
    return 'Unknown';
  }
  return RoleCode[roleCode] ?? `Role ${roleCode}`;
}
