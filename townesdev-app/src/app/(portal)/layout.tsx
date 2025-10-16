import { ReactNode } from "react";
import "../globals.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="min-h-screen flex flex-col">
      <Header variant="portal" />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer variant="portal" />
    </div>
  );
}
