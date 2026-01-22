import { createBrowserRouter } from 'react-router-dom'
import { LoginPage, RegisterPage } from '@/pages/auth'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <LoginPage />,
  },
])