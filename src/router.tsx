import { createBrowserRouter } from 'react-router-dom'
import { MainLayout, MinimalLayout } from '@/components/layout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage, RegisterPage, CallbackPage } from '@/pages/auth'
import Catalogue from '@/pages/Catalogue'
import ProductDetail from '@/pages/ProductDetail'
import CategoryPage from '@/pages/CategoryPage'
import NotFoundPage from '@/pages/NotFoundPage'


export const router = createBrowserRouter([
  // ============================================
  // ROUTES PUBLIQUES AVEC LAYOUT PRINCIPAL
  // ============================================
  {
    element: <MainLayout />,
    children: [
      {
        path: '/galerie',
        element: <Catalogue />,
      },
      {
        path: '/oeuvre/:slug',
        element: <ProductDetail />,
      },
      {
        path: '/collections',
        element: <div className="pt-20 p-8">Page Collections (à créer)</div>,
      },
      {
        path: '/categorie/:slug',
        element: <CategoryPage />,
      },
      {
        path: '/artiste',
        element: <div className="pt-20 p-8">Page Artiste (à créer)</div>,
      },
      {
        path: '/contact',
        element: <div className="pt-20 p-8">Page Contact (à créer)</div>,
      },
      {
        path: '/favoris',
        element: <div className="pt-20 p-8">Page Favoris (à créer)</div>,
      },
      {
        path: '/panier',
        element: <div className="pt-20 p-8">Page Panier (à créer)</div>,
      },
      {
        path: '/compte',
        element: <div className="pt-20 p-8">Page Mon Compte (à créer)</div>,
      },
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
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },

  // ============================================
  // ROUTES SANS LAYOUT (pages plein écran)
  // ============================================
  {
    element: <MinimalLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
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