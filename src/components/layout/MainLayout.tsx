import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

interface MainLayoutProps {
  /** Header transparent (utile pour les pages avec hero image/vidéo) */
  transparentHeader?: boolean
  /** Afficher le footer */
  showFooter?: boolean
}

/**
 * Layout principal de l'application
 * Encapsule le Header, le contenu (Outlet) et le Footer
 */
export function MainLayout({
  transparentHeader = false,
  showFooter = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header transparent={transparentHeader} />

      {/* Contenu principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {showFooter && <Footer />}
    </div>
  )
}

/**
 * Layout sans footer (pour les pages auth, checkout, etc.)
 */
export function MinimalLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Outlet />
    </div>
  )
}