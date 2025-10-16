"use client";

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

  return (
    <footer
      className={`border-t p-4 text-center text-sm font-body font-medium ${getFooterBg()}`}
    >
      <span className="text-nile-blue-200 dark:text-nile-blue-800">
        {getFooterText()}
      </span>
    </footer>
  );
}
