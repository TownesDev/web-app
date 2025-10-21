'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  User,
  ChevronDown,
  LayoutDashboard,
  UserCircle,
  Shield,
  LogOut,
} from 'lucide-react'

interface SessionUser {
  id: string
  email: string
  name: string
  role?: string
}

export function AuthStatus() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check session on mount
    checkSession()
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const sessionData = await response.json()
        setUser(sessionData.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-8 w-24 rounded"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <a
          href="/auth/signin"
          className="text-nile-blue-800 dark:text-nile-blue-200 hover:text-nile-blue-900 dark:hover:text-nile-blue-100 font-body text-sm font-medium transition-colors"
        >
          Sign In
        </a>
        <a
          href="/auth/signup"
          className="bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors"
        >
          Sign Up
        </a>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Menu Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-nile-blue-800 dark:text-nile-blue-200 hover:text-nile-blue-900 dark:hover:text-nile-blue-100 font-body text-sm font-medium transition-colors"
      >
        {/* Placeholder Avatar */}
        <div className="w-8 h-8 bg-nile-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-nile-blue-600" />
        </div>
        <span>Welcome, {user.name}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Dashboard - context aware */}
          <Link
            href={user.role === 'admin' || user.role === 'staff' ? '/admin' : '/app'}
            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-nile-blue-50 hover:text-nile-blue-900 transition-colors"
            onClick={() => setDropdownOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          {/* Profile */}
          <Link
            href="/app/profile"
            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-nile-blue-50 hover:text-nile-blue-900 transition-colors"
            onClick={() => setDropdownOpen(false)}
          >
            <UserCircle className="w-4 h-4" />
            <span>Profile</span>
          </Link>

          {/* Portal Toggle (only for admin/staff) */}
          {(user.role === 'admin' || user.role === 'staff') && (
            <Link
              href={window.location.pathname.startsWith('/admin') ? '/app' : '/admin'}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-nile-blue-50 hover:text-nile-blue-900 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <Shield className="w-4 h-4" />
              <span>
                {window.location.pathname.startsWith('/admin')
                  ? 'Switch to Client Portal'
                  : 'Switch to Admin Portal'}
              </span>
            </Link>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* Sign Out */}
          <button
            onClick={() => {
              handleSignOut()
              setDropdownOpen(false)
            }}
            className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}
