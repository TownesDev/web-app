import { ReactNode } from "react";
import "../globals.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="min-h-screen flex flex-col">
      <Header variant="admin" />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 bg-slate-50">{children}</main>
      </div>
      <Footer variant="admin" />
    </div>
  );
}
