/**
 * Role-Based Access Control (RBAC) Types
 * Defines roles, capabilities, and access control interfaces
 */

export type UserRole = "admin" | "staff" | "client" | "user";

export type Capability =
  // Client management
  | "clients:read"
  | "clients:write"
  // Invoice management
  | "invoices:read"
  | "invoices:write"
  // Content management (for Sanity Studio)
  | "content:read"
  | "content:write"
  // System administration
  | "system:read"
  | "system:write"
  // Bot platform management
  | "bot:tenants:provision"
  | "bot:tenants:manage"
  | "bot:assets:register"
  | "bot:assets:manage"
  | "bot:features:toggle";

export interface UserWithRole {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AccessControlError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND";
  requiredCapability?: Capability;
  userRole?: UserRole;
}
