'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AuthStatus } from './AuthStatus'

type HeaderVariant = 'public' | 'portal' | 'admin'

interface HeaderProps {
  variant: HeaderVariant
}

export default function Header({ variant }: HeaderProps) {
  const getMainTitle = () => {
    return 'TownesDev'
  }

  const getSectionBadge = () => {
    switch (variant) {
      case 'portal':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-nile-blue-100 text-nile-blue-800 border border-nile-blue-200">
            Client
          </span>
        )
      case 'admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sandy-brown-100 text-sandy-brown-800 border border-sandy-brown-200">
            Staff
          </span>
        )
      default:
        return null
    }
  }

  const getQuickNav = () => {
    switch (variant) {
      case 'portal':
        // Navigation moved to ClientSidebar
        return null
      case 'admin':
        // Navigation moved to AdminSidebar
        return null
      default:
        return (
          <nav aria-label="Public site">
            <ul className="hidden md:flex items-center gap-6 ml-8">
              <li>
                <Link
                  href="/#home"
                  className="text-nile-blue-100 hover:text-white text-sm font-medium"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-nile-blue-100 hover:text-white text-sm font-medium"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-nile-blue-100 hover:text-white text-sm font-medium"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/plans"
                  className="text-nile-blue-100 hover:text-white text-sm font-medium"
                >
                  Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-nile-blue-100 hover:text-white text-sm font-medium"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        )
    }
  }

  return (
    <header className="border-b bg-nile-blue-800 flex justify-between items-center shadow-sm p-4">
      <div className="flex items-center">
        {/* Logo and Title Section */}
        <Link
          href="/"
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative w-[40px] h-[36px]">
            <Image
              src="/townesdev_icon_dark.svg"
              alt="TownesDev Logo"
              fill
              className="object-contain dark:hidden"
            />
            <Image
              src="/townesdev_icon_light.svg"
              alt="TownesDev Logo"
              fill
              className="object-contain hidden dark:block"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-heading text-nile-blue-100 leading-tight">
                {getMainTitle()}
              </h1>
              {getSectionBadge()}
            </div>
          </div>
        </Link>

        {/* Quick Navigation */}
        {getQuickNav()}
      </div>

      <div className="flex items-center gap-3">
        <AuthStatus />
      </div>
    </header>
  )
}
