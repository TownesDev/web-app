"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthStatus } from "./AuthStatus";

type HeaderVariant = "public" | "portal" | "admin";

interface HeaderProps {
  variant: HeaderVariant;
}

export default function Header({ variant }: HeaderProps) {
  const getMainTitle = () => {
    return "TownesDev";
  };

  const getSubtitle = () => {
    switch (variant) {
      case "portal":
        return "Client Portal";
      case "admin":
        return "Admin Portal";
      default:
        return null;
    }
  };

  const getSectionBadge = () => {
    switch (variant) {
      case "portal":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-nile-blue-100 text-nile-blue-800">
            Client
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sandy-brown-100 text-sandy-brown-800">
            Staff
          </span>
        );
      default:
        return null;
    }
  };

  const getQuickNav = () => {
    switch (variant) {
      case "portal":
        // Navigation moved to ClientSidebar
        return null;
      case "admin":
        // Navigation moved to AdminSidebar
        return null;
      default:
        return null;
    }
  };

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
            {getSubtitle() && (
              <p className="text-sm font-body text-nile-blue-200 font-medium">
                {getSubtitle()}
              </p>
            )}
          </div>
        </Link>

        {/* Quick Navigation */}
        {getQuickNav()}
      </div>

      {/* Auth Status */}
      <AuthStatus />
    </header>
  );
}
