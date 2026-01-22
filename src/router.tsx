import { createBrowserRouter } from 'react-router-dom'
import { CallbackPage, LoginPage, RegisterPage } from '@/pages/auth'
import { HomePage } from './pages/HomePage'

export const router = createBrowserRouter([
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
])