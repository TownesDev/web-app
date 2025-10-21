/**
 * RBAC Guards
 * Functions to enforce access control in server components and API routes
 */

import { redirect } from 'next/navigation'
import { getSession } from '../session'
import { runQuery } from '../client'
import { qUserById } from '../../sanity/lib/queries'
import { UserRole, Capability, UserWithRole, AccessControlError } from './types'
import { isStaffRole, roleHasCapability } from './util'

/**
 * Get the current user's role from the database
 */
export async function getCurrentUserRole(): Promise<UserWithRole | null> {
  try {
    const session = await getSession()
    if (!session) {
      return null
    }

    const user = await runQuery(qUserById, { id: session.id })
    if (!user) {
      return null
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    }
  } catch (error) {
    console.error('Error getting current user role:', error)
    return null
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(): Promise<UserWithRole> {
  const user = await getCurrentUserRole()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

/**
 * Require staff role (admin or staff) - redirects to 403 if not staff
 */
export async function requireStaff(): Promise<UserWithRole> {
  const user = await requireAuth()

  if (!isStaffRole(user.role)) {
    redirect('/403')
  }

  return user
}

/**
 * Require specific capability - throws AccessControlError if not authorized
 */
export async function requireCapability(
  capability: Capability
): Promise<UserWithRole> {
  const user = await requireAuth()

  if (!roleHasCapability(user.role, capability)) {
    const error = new Error(
      `Missing required capability: ${capability}`
    ) as AccessControlError
    error.code = 'FORBIDDEN'
    error.requiredCapability = capability
    error.userRole = user.role
    throw error
  }

  return user
}

/**
 * Check if current user has a capability (doesn't throw, returns boolean)
 */
export async function hasCapability(capability: Capability): Promise<boolean> {
  try {
    const user = await getCurrentUserRole()
    return user ? roleHasCapability(user.role, capability) : false
  } catch {
    return false
  }
}

/**
 * Check if current user is staff (doesn't throw, returns boolean)
 */
export async function isCurrentUserStaff(): Promise<boolean> {
  try {
    const user = await getCurrentUserRole()
    return user ? isStaffRole(user.role) : false
  } catch {
    return false
  }
}
