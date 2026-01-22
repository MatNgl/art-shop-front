import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

/**
 * Hook pour accéder au contexte d'authentification
 * @throws Error si utilisé en dehors du AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }

  return context
}