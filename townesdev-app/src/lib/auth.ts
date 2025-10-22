import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getSession } from './session' // Adjust the import based on your project structure

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface User {
  _id: string
  email: string
  name: string
  password: string
}

// Dynamic import helper for Sanity client
async function getSanityWriteClient() {
  const { sanityWrite } = await import('./client')
  return sanityWrite
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: {
  id: string
  email: string
  name: string
}): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(
  token: string
): { id: string; email: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      name: string
    }
  } catch {
    return null
  }
}

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const sanityWrite = await getSanityWriteClient()

  // Check if user already exists
  const existingUser = await sanityWrite.fetch(
    `*[_type == "user" && email == $email][0]`,
    { email }
  )

  if (existingUser) {
    throw new Error('User already exists')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user in Sanity
  const user = await sanityWrite.create({
    _type: 'user',
    email,
    name,
    password: hashedPassword,
  })

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    password: user.password,
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const sanityWrite = await getSanityWriteClient()

  const user = await sanityWrite.fetch(
    `*[_type == "user" && email == $email][0]{
      _id,
      email,
      name,
      password
    }`,
    { email }
  )

  return user || null
}

export async function findUserById(id: string): Promise<User | null> {
  const sanityWrite = await getSanityWriteClient()

  const user = await sanityWrite.fetch(
    `*[_type == "user" && _id == $id][0]{
      _id,
      email,
      name,
      password
    }`,
    { id }
  )

  return user || null
}

export async function getCurrentClient() {
  const session = await getSession()
  console.log('getCurrentClient: Session retrieved:', session)
  if (!session) return null

  const sanityWrite = await getSanityWriteClient()
  const client = await sanityWrite.fetch(
    `*[_type=="client" && user._ref==$userId][0]{
      _id, name, email, status,
      startDate, maintenanceWindow,
      selectedPlan->{name,price,features}
    }`,
    { userId: session.id }
  )
  console.log('getCurrentClient: Client fetched:', client)

  return client || null
}
