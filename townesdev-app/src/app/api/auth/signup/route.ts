import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '../../../../lib/auth'
import { sanityWrite } from '@/lib/client'
import { createSession } from '@/lib/session'
import { isMaintenanceMode } from '@/lib/maintenance'
import { maintenanceUnavailableResponse } from '@/lib/maintenanceResponse'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  if (isMaintenanceMode()) return maintenanceUnavailableResponse()

  try {
    const {
      email,
      password,
      name,
      businessName,
      elevatorPitch,
      brand,
      market,
    } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create user
    const user = await createUser(email, password, name)

    // Create client record with onboarding data
    const clientId = uuidv4()
    const clientResult = await sanityWrite.create({
      _id: clientId,
      _type: 'client',
      name: businessName || name,
      email,
      status: 'Active',
      user: {
        _type: 'reference',
        _ref: user._id,
      },
      hasActiveSubscription: false, // Will be set to true after Stripe payment
      onboardingStatus: 'awaiting_payment',
      // Store onboarding data for later use
      metadata: {
        elevatorPitch: elevatorPitch || '',
        brand: brand || {},
        market: market || '',
      },
    })

    // Create session for the new user
    await createSession({
      id: user._id,
      email: user.email,
      name: user.name,
      role: 'client',
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      client: {
        id: clientResult._id,
        name: clientResult.name,
      },
    })
  } catch (error: unknown) {
    console.error('Sign up error:', error)

    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
