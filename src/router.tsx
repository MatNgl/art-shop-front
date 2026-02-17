import { createBrowserRouter } from 'react-router-dom'
import { MainLayout, MinimalLayout } from '@/components/layout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage, RegisterPage, CallbackPage } from '@/pages/auth'

// Pages à créer plus tard
// import { GalleryPage } from '@/pages/GalleryPage'
// import { ProductDetailPage } from '@/pages/ProductDetailPage'
// import { CategoryPage } from '@/pages/CategoryPage'
// import { ArtistPage } from '@/pages/ArtistPage'
// import { ContactPage } from '@/pages/ContactPage'

export const router = createBrowserRouter([
  // ============================================
  // ROUTES PUBLIQUES AVEC LAYOUT PRINCIPAL
  // ============================================
  {
    element: <MainLayout />,
    children: [
      // Galerie (à créer)
      {
        path: '/galerie',
        element: <div className="pt-20 p-8">Page Galerie (à créer)</div>,
      },
      // Collections / Catégories (à créer)
      {
        path: '/collections',
        element: <div className="pt-20 p-8">Page Collections (à créer)</div>,
      },
      // Détail d'une œuvre (à créer)
      {
        path: '/oeuvre/:slug',
        element: <div className="pt-20 p-8">Page Détail Œuvre (à créer)</div>,
      },
      // Page artiste (à créer)
      {
        path: '/artiste',
        element: <div className="pt-20 p-8">Page Artiste (à créer)</div>,
      },
      // Contact (à créer)
      {
        path: '/contact',
        element: <div className="pt-20 p-8">Page Contact (à créer)</div>,
      },
      // Favoris (à créer)
      {
        path: '/favoris',
        element: <div className="pt-20 p-8">Page Favoris (à créer)</div>,
      },
      // Panier (à créer)
      {
        path: '/panier',
        element: <div className="pt-20 p-8">Page Panier (à créer)</div>,
      },
      // Compte utilisateur (à créer)
      {
        path: '/compte',
        element: <div className="pt-20 p-8">Page Mon Compte (à créer)</div>,
      },
      // Pages légales
      {
        path: '/mentions-legales',
        element: <div className="pt-20 p-8">Mentions légales (à créer)</div>,
      },
      {
        path: '/cgv',
        element: <div className="pt-20 p-8">CGV (à créer)</div>,
      },
      {
        path: '/confidentialite',
        element: <div className="pt-20 p-8">Politique de confidentialité (à créer)</div>,
      },
    ],
  },

  // ============================================
  // ROUTES SANS LAYOUT (pages plein écran)
  // ============================================
  {
    element: <MinimalLayout />,
    children: [
      // Home (layout custom avec header transparent)
      {
        path: '/',
        element: <HomePage />,
      },
      // Auth
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/auth/callback',
        element: <CallbackPage />,
      },
    ],
  },
])