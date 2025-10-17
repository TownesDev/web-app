import { ReactNode } from "react";
import "../globals.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="min-h-screen flex flex-col">
      <Header variant="admin" />
      <main className="flex-grow bg-slate-50">{children}</main>
      <Footer variant="admin" />
    </div>
  );
}
