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
        return "Admin";
      default:
        return null;
    }
  };

  return (
    <header className="border-b p-4 bg-nile-blue-800 flex justify-between items-center shadow-sm">
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
          <h1 className="text-xl font-bold font-heading text-nile-blue-100 leading-tight">
            {getMainTitle()}
          </h1>
          {getSubtitle() && (
            <p className="text-sm font-body text-nile-blue-200 font-medium">
              {getSubtitle()}
            </p>
          )}
        </div>
      </Link>
      <AuthStatus />
    </header>
  );
}
