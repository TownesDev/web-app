"use client";

import Link from "next/link";

type FooterVariant = "public" | "portal" | "admin";

interface FooterProps {
  variant: FooterVariant;
}

export default function Footer({ variant }: FooterProps) {
  const getFooterText = () => {
    switch (variant) {
      case "public":
        return "© " + new Date().getFullYear() + " TownesDev";
      case "portal":
        return "© " + new Date().getFullYear() + " TownesDev Client Portal";
      case "admin":
        return "© " + new Date().getFullYear() + " TownesDev Admin";
      default:
        return "© " + new Date().getFullYear() + " TownesDev";
    }
  };

  const getFooterBg = () => {
    switch (variant) {
      case "public":
        return "bg-picton-blue-50";
      case "portal":
        return "bg-comet-50";
      case "admin":
        return "bg-picton-blue-50";
      default:
        return "bg-picton-blue-50";
    }
  };

  const getFooterNav = () => {
    switch (variant) {
      case "public":
        return (
          <nav className="flex flex-wrap justify-center items-center space-x-6 mt-4">
            <Link
              href="/"
              className="text-nile-blue-600 hover:text-nile-blue-800 font-body text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/status"
              className="text-nile-blue-600 hover:text-nile-blue-800 font-body text-sm font-medium transition-colors"
            >
              Status
            </Link>
            <Link
              href="/brand"
              className="text-nile-blue-600 hover:text-nile-blue-800 font-body text-sm font-medium transition-colors"
            >
              Brand
            </Link>
          </nav>
        );
      default:
        return null;
    }
  };

  return (
    <footer
      className={`border-t p-4 text-center text-sm font-body font-medium ${getFooterBg()}`}
    >
      <span className="text-nile-blue-200 dark:text-nile-blue-800">
        {getFooterText()}
      </span>
      {getFooterNav()}
    </footer>
  );
}
