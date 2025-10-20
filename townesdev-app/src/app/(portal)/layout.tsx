import { ReactNode } from "react";
import "../globals.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ClientSidebar from "../../components/ClientSidebar";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="min-h-screen flex flex-col">
      <Header variant="portal" />
      <div className="flex flex-1">
        <ClientSidebar />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
      <Footer variant="portal" />
    </div>
  );
}
