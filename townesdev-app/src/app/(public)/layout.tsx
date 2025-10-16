import { ReactNode } from "react";
import '../globals.css'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b p-4">
          <h1 className="text-xl font-bold">TownesDev</h1>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="border-t p-4 text-center text-sm">
          © {new Date().getFullYear()} TownesDev
        </footer>
      </body>
    </html>
  );
}
