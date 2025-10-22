'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Calendar,
  Menu,
  X,
  Settings,
  CreditCard,
  Award,
  Layers,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    href: '/app',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/app/assets',
    label: 'My Assets',
    icon: Layers,
  },
  {
    href: '/app/entitlements',
    label: 'Subscriptions',
    icon: Award,
  },
  {
    href: '/app/plans',
    label: 'Upgrade Plans',
    icon: CreditCard,
  },
  {
    href: '/app/invoices',
    label: 'Invoices',
    icon: FileText,
  },
  {
    href: '/app/incidents',
    label: 'Support',
    icon: AlertTriangle,
  },
  {
    href: '/app/rhythm',
    label: 'Monthly Rhythm',
    icon: Calendar,
  },
  {
    href: '/app/profile',
    label: 'Account Settings',
    icon: Settings,
  },
]

export default function ClientSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === '/app'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Client portal navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-nile-blue-50 to-white">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-nile-blue-100 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-nile-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold font-heading text-nile-blue-900">
                Client Portal
              </h2>
              <p className="text-xs text-gray-600">Manage your services</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-nile-blue-500"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
          aria-controls="sidebar-navigation"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5 text-gray-600" />
          ) : (
            <X className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4" aria-label="Main navigation" id="sidebar-navigation">
        <ul className="space-y-2" role="list">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-nile-blue-500 ${
                    active
                      ? 'bg-nile-blue-50 text-nile-blue-900 border-r-2 border-nile-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-nile-blue-900'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {isCollapsed && <span className="sr-only">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
