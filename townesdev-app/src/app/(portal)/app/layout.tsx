import { ReactNode } from "react";
import { AuthStatus } from '../../../components/AuthStatus'

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" >
        <header className="border-b p-4 flex justify-between items-center bg-nile-blue-50">
          <h1 className="text-xl font-bold font-heading text-nile-blue-900">TownesDev Client Portal</h1>
          <AuthStatus />
        </header>
        <main className="min-h-screen bg-gray-50">{children}</main>
        <footer className="border-t p-4 text-center text-sm font-body bg-white">
          © {new Date().getFullYear()} TownesDev Client Portal
        </footer>
    </div>
  );
}