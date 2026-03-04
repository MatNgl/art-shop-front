import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Toaster } from '@/components/feedback'
import { CartProvider } from '@/contexts/CartProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import './index.css'


createRoot(document.getElementById('root')!).render(
 <StrictMode>
    <AuthProvider>
      <CartProvider>
      <RouterProvider router={router} />
      <Toaster />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)