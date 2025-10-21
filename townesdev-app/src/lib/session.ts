import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import { runQuery } from './client'
import { qUserById } from '../sanity/lib/queries'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Verify user still exists in database and get role
    const user = await runQuery(qUserById, { id: payload.id })
    if (!user) {
      return null
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    }
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}
