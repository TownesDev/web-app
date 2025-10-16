import { ReactNode } from "react";
import '../globals.css'
import { AuthStatus } from '../../components/AuthStatus'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" >
        <header className="border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold font-heading">TownesDev</h1>
          <AuthStatus />
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="border-t p-4 text-center text-sm font-body">
          © {new Date().getFullYear()} TownesDev
        </footer>
    </div>
  );
}
