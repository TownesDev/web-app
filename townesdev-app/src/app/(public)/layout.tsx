import { ReactNode } from 'react'
import '../globals.css'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="min-h-screen flex flex-col">
      <Header variant="public" />
      <main className="flex-grow">{children}</main>
      <Footer variant="public" />
    </div>
  )
}
