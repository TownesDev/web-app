/**
 * RBAC Utilities
 * Maps roles to capabilities and provides helper functions
 */

import { UserRole, Capability } from "./types";

/**
 * Maps user roles to their granted capabilities
 */
export const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
  admin: [
    "clients:read",
    "clients:write",
    "invoices:read",
    "invoices:write",
    "content:read",
    "content:write",
    "system:read",
    "system:write",
  ],
  staff: [
    "clients:read",
    "clients:write",
    "invoices:read",
    "invoices:write",
    "content:read",
    "content:write",
  ],
  client: [
    "clients:read", // Can read their own client data
    "invoices:read", // Can read their own invoices
  ],
  user: [
    // Basic user with no special capabilities
  ],
};

/**
 * Check if a role has a specific capability
 */
export function roleHasCapability(
  role: UserRole,
  capability: Capability
): boolean {
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

/**
 * Get all capabilities for a role
 */
export function getRoleCapabilities(role: UserRole): Capability[] {
  return ROLE_CAPABILITIES[role] ?? [];
}

/**
 * Check if a role is considered staff (has admin access)
 */
export function isStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "staff";
}

/**
 * Check if a role can access admin areas
 */
export function canAccessAdmin(role: UserRole): boolean {
  return isStaffRole(role);
}
