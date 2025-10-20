"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Users,
  FileText,
  AlertTriangle,
  Mail,
  Settings,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: BarChart3,
  },
  {
    href: "/admin/clients",
    label: "Clients",
    icon: Users,
  },
  {
    href: "/admin/invoices",
    label: "Invoices",
    icon: FileText,
  },
  {
    href: "/admin/incidents",
    label: "Incidents",
    icon: AlertTriangle,
  },
  {
    href: "/admin/email-templates",
    label: "Email Templates",
    icon: Mail,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-sandy-brown-50 to-white">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sandy-brown-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-sandy-brown-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold font-heading text-gray-900">
                Admin Portal
              </h2>
              <p className="text-xs text-gray-600">System management</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5 text-gray-600" />
          ) : (
            <X className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-nile-blue-50 text-nile-blue-900 border-r-2 border-nile-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-nile-blue-900"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
