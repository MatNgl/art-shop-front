import { Link } from 'react-router-dom'
import { LogIn, LogOut, UserPlus } from 'lucide-react'

import { useAuth } from '@/hooks'
import { Button } from '@/components/ui/button'
import Iridescence from '@/components/backgrounds/Iridescence'

export function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  // Affiche un loader pendant la vérification du token
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center">
      {/* Background */}
      <Iridescence color={[0.4, 0.3, 0.5]} mouseReact={true} />

      {/* Contenu */}
      <div className="relative z-10 text-center p-8">
        {/* Card glassmorphism */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-xl max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Art Shop
          </h1>

          {isAuthenticated && user ? (
            <>
              <p className="text-xl text-gray-700 mb-2">
                Bienvenue
              </p>
              <p className="text-lg font-medium text-gray-900 mb-8">
                {user.email}
              </p>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="lg"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut size={18} />
                Se déconnecter
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-600 mb-8">
                Galerie d'art en ligne
              </p>

              <div className="space-y-3">
                <Link to="/login">
                <Button>
                    <LogIn size={18} />
                    Se connecter
                </Button>
                </Link>

               
                <Link to="/register">
                <Button>
                    <UserPlus size={18} />
                    Créer un compte
                </Button>
                  </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}