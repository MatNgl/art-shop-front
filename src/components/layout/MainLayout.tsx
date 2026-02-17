import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

interface MainLayoutProps {
  showFooter?: boolean
}

export function MainLayout({ showFooter = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* padding-top = hauteur du header fixe (h-20 = 80px) */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {showFooter && <Footer />}
    </div>
  )
}

export function MinimalLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Outlet />
    </div>
  )
}