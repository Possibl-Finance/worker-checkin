import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b p-4">
        <h1 className="text-xl font-bold">Projuno Admin</h1>
      </nav>
      <main>{children}</main>
    </div>
  )
}