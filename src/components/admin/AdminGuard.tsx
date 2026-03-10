import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!ADMIN_ROLES.includes(user.role.code)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}