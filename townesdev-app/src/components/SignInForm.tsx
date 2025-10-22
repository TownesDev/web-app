'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        // Only auto-switch if no manual preference is saved
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Sign in failed')
      }

      const result = await response.json()
      console.log('Sign in successful:', result)

      // Success - show success message and redirect
      setError('')
      toast.success('Sign in successful!', {
        description: 'Welcome back!',
      })
      setTimeout(() => {
        // If tester bypass cookie is present, send user to client portal
        const cookies = document.cookie || ''
        const hasBypass = cookies.includes('maintenance-bypass=allow')
        window.location.href = hasBypass ? '/app' : '/'
      }, 1500)
    } catch (err: unknown) {
      console.error('Sign in exception:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred during sign in. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-comet-700 dark:text-comet-300 font-body"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby="email-error"
          className="mt-2 block w-full px-4 py-3 border-2 border-comet-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-nile-blue-500 transition-all font-body bg-white dark:bg-comet-800 text-comet-900 dark:text-white placeholder-comet-500 dark:placeholder-comet-400"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-comet-700 dark:text-comet-300 font-body"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-describedby="password-error"
          className="mt-2 block w-full px-4 py-3 border-2 border-comet-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-nile-blue-500 transition-all font-body bg-white dark:bg-comet-800 text-comet-900 dark:text-white placeholder-comet-500 dark:placeholder-comet-400"
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <div
          id="form-error"
          className="text-red-600 dark:text-red-400 text-sm font-body"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nile-blue-600 hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nile-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-body"
        aria-describedby={loading ? 'loading-status' : undefined}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span id="loading-status">Signing in...</span>
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-comet-600 dark:text-comet-400 font-body">
          Don&apos;t have an account?{' '}
          <a
            href="/auth/signup"
            className="text-nile-blue-600 hover:text-nile-blue-700 font-medium"
          >
            Create account
          </a>
        </p>
      </div>
    </form>
  )
}
