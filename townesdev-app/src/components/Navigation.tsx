'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface NavigationProps {
  isHomePage?: boolean
}

export function Navigation({ isHomePage = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Home', href: '/', isHome: true },
    { name: 'Services', href: '/#services', isAnchor: true },
    { name: 'About', href: '/#about', isAnchor: true },
    { name: 'Plans', href: '/plans', isExternal: false },
    { name: 'Contact', href: '/contact', isExternal: false },
  ]

  const handleAnchorClick = (href: string) => {
    if (href.startsWith('/#')) {
      // If we're not on home page, navigate to home first
      if (!isHomePage) {
        window.location.href = href
        return
      }

      // If we're on home page, smooth scroll to section
      const elementId = href.replace('/#', '')
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src="/townesdev_logo_sub_light.svg"
                alt="TownesDev"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/townesdev_logo_sub_dark.svg"
                alt="TownesDev"
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>
            <span className="text-xl font-bold text-nile-blue-900 hidden sm:block">
              TownesDev
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                onAnchorClick={handleAnchorClick}
              />
            ))}

            {/* CTA Button */}
            <Link
              href="/auth/signup"
              className="bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Start Project
            </Link>

            {/* Client Portal Link */}
            <Link
              href="/app"
              className="text-nile-blue-600 hover:text-nile-blue-700 font-medium text-sm transition-colors"
            >
              Client Portal
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-nile-blue-500"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {/* Hamburger icon */}
            <svg
              className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            {/* Close icon */}
            <svg
              className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => (
                <MobileNavItem
                  key={item.name}
                  item={item}
                  onAnchorClick={handleAnchorClick}
                />
              ))}

              {/* Mobile CTAs */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/auth/signup"
                  className="block w-full text-center bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Project
                </Link>
                <Link
                  href="/app"
                  className="block w-full text-center text-nile-blue-600 hover:text-nile-blue-700 font-medium text-sm transition-colors px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Client Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

interface NavItemProps {
  item: {
    name: string
    href: string
    isHome?: boolean
    isAnchor?: boolean
    isExternal?: boolean
  }
  onAnchorClick: (href: string) => void
  isHomePage: boolean
}

function NavItem({ item, onAnchorClick }: Omit<NavItemProps, 'isHomePage'>) {
  if (item.isAnchor) {
    return (
      <button
        onClick={() => onAnchorClick(item.href)}
        className="text-gray-700 hover:text-nile-blue-600 font-medium text-sm transition-colors"
      >
        {item.name}
      </button>
    )
  }

  return (
    <Link
      href={item.href}
      className="text-gray-700 hover:text-nile-blue-600 font-medium text-sm transition-colors"
    >
      {item.name}
    </Link>
  )
}

function MobileNavItem({
  item,
  onAnchorClick,
}: Omit<NavItemProps, 'isHomePage'>) {
  if (item.isAnchor) {
    return (
      <button
        onClick={() => onAnchorClick(item.href)}
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-nile-blue-600 hover:bg-gray-50 transition-colors w-full text-left"
      >
        {item.name}
      </button>
    )
  }

  return (
    <Link
      href={item.href}
      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-nile-blue-600 hover:bg-gray-50 transition-colors"
      onClick={() => {}}
    >
      {item.name}
    </Link>
  )
}
