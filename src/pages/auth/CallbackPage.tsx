import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TOKEN_KEY } from '@/services/api'

/**
 * Page de callback pour Google OAuth
 * Récupère le token depuis l'URL et authentifie l'utilisateur
 */
export function CallbackPage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = () => {
      // Récupère le token depuis l'URL
      const token = searchParams.get('token')

      if (!token) {
        // Pas de token, redirige vers login
        window.location.href = '/login'
        return
      }

      // Stocke le token dans localStorage
      localStorage.setItem(TOKEN_KEY, token)

      // Redirige vers la home (force le rechargement pour que AuthContext détecte le token)
      window.location.href = '/'
    }

    handleCallback()
  }, [searchParams])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
        <p className="text-gray-600">Authentification en cours...</p>
      </div>
    </div>
  )
}
