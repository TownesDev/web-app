'use client'

import Link from 'next/link'

type FooterVariant = 'public' | 'portal' | 'admin'

interface FooterProps {
  variant: FooterVariant
}

export default function Footer({ variant }: FooterProps) {
  const getFooterText = () => {
    switch (variant) {
      case 'public':
        return '© ' + new Date().getFullYear() + ' TownesDev'
      case 'portal':
        return '© ' + new Date().getFullYear() + ' TownesDev Client Portal'
      case 'admin':
        return '© ' + new Date().getFullYear() + ' TownesDev Admin'
      default:
        return '© ' + new Date().getFullYear() + ' TownesDev'
    }
  }

  const getFooterBg = () => {
    switch (variant) {
      case 'public':
        return 'bg-white dark:bg-nile-blue-900'
      case 'portal':
        return 'bg-white dark:bg-nile-blue-900'
      case 'admin':
        return 'bg-white dark:bg-nile-blue-900'
      default:
        return 'bg-white dark:bg-nile-blue-900'
    }
  }

  const getFooterNav = () => {
    switch (variant) {
      case 'public':
        return (
          <nav className="flex flex-wrap justify-center items-center space-x-6 mt-4">
            <Link
              href="/"
              className="text-nile-blue-600 hover:text-nile-blue-800 dark:text-nile-blue-100 dark:hover:text-white font-body text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/status"
              className="text-nile-blue-600 hover:text-nile-blue-800 dark:text-nile-blue-100 dark:hover:text-white font-body text-sm font-medium transition-colors"
            >
              Status
            </Link>
            <Link
              href="/brand"
              className="text-nile-blue-600 hover:text-nile-blue-800 dark:text-nile-blue-100 dark:hover:text-white font-body text-sm font-medium transition-colors"
            >
              Brand
            </Link>
          </nav>
        )
      default:
        return null
    }
  }

  return (
    <footer
      className={`border-t border-gray-200 dark:border-white/10 p-4 text-center text-sm font-body font-medium ${getFooterBg()}`}
    >
      <span className="text-gray-500 dark:text-nile-blue-200">
        {getFooterText()}
      </span>
      {getFooterNav()}
    </footer>
  )
}
