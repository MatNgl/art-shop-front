import { createBrowserRouter } from 'react-router-dom'
import { MainLayout, MinimalLayout } from '@/components/layout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage, RegisterPage, CallbackPage } from '@/pages/auth'
import Catalogue from '@/pages/Catalogue'
import ProductDetail from '@/pages/ProductDetail'
import CategoryPage from '@/pages/CategoryPage'
import NotFoundPage from '@/pages/NotFoundPage'
import CartPage from '@/pages/CartPage'
import ProfilePage from '@/pages/ProfilePage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { AdminLayout } from '@/components/admin'
import { DashboardPage, UsersPage, LogsPage, MaterialsPage, FormatsPage, CategoriesPage, ProductsPage, ProductEditorPage  } from '@/pages/admin'

export const router = createBrowserRouter([
  
  // ROUTES PUBLIQUES AVEC LAYOUT PRINCIPAL
  
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
        element: <CartPage />,
      },
      {
        path: '/profil',
        element: <ProfilePage />,
      },

      //  Tunnel de commande 
      {
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/orders/:id/confirmation',
        element: <OrderConfirmationPage />,
      },

      //  Suivi commandes 
      {
        path: '/commandes',
        element: <OrdersPage />,
      },
      {
        path: '/commandes/:id',
        element: <OrderDetailPage />,
      },

      //  Pages légales 
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

  
  // ROUTES SANS LAYOUT (pages plein écran)
  
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

  // ADMIN
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'commandes', element: <div className="p-8 text-gray-400">Gestion des commandes (à venir)</div> },
      { path: 'commandes/:id', element: <div className="p-8 text-gray-400">Détail commande admin (à venir)</div> },
      { path: 'catalogue', element: <div className="p-8 text-gray-400">Gestion du catalogue (à venir)</div> },
      { path: 'logs', element: <LogsPage /> },      
      { path: 'produits', element: <ProductsPage /> },
      { path: 'produits/nouveau', element: <ProductEditorPage /> },
      { path: 'produits/:id', element: <ProductEditorPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'formats', element: <FormatsPage /> },
      { path: 'materiaux', element: <MaterialsPage /> },      
      { path: 'utilisateurs', element: <UsersPage /> },      
      { path: 'paniers', element: <div className="p-8 text-gray-400">Gestion des paniers (à venir)</div> },
    ],
  },
])