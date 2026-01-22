import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'

import Iridescence from '@/components/backgrounds/Iridescence'
import { FormInput, FormPassword } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { loginSchema, type LoginFormData } from '@/schemas'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      await login(data)

      toast.success('Connexion réussie', {
        description: 'Bienvenue sur Art Shop',
      })

      navigate('/')
    } catch (error) {
      toast.error('Erreur de connexion', {
        description: error instanceof Error ? error.message : 'Email ou mot de passe incorrect.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex">
      {/* Background Iridescence */}
      <Iridescence color={[0.6, 0.6, 0.5]} mouseReact={true} />

      {/* Partie gauche - branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
        <div className="text-center text-white z-10">
          <h2 className="text-5xl font-bold mb-4">Art Shop</h2>
          <p className="text-xl text-white/80">Galerie d'art en ligne</p>
        </div>
      </div>

      {/* Partie droite - formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 relative">
        {/* Overlay glassmorphism */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-md" />

        {/* Contenu du formulaire */}
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Connexion
            </h1>
            <p className="text-gray-600 text-sm">
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              label="Email"
              type="email"
              placeholder="votre@email.com"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-2">
              <FormPassword
                label="Mot de passe"
                placeholder="Votre mot de passe"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline underline-offset-4 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-6 bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
              isLoading={isLoading}
              disabled={!isValid}
            >
              Se connecter
            </Button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Bouton Google */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
            onClick={handleGoogleAuth}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </Button>

          {/* Lien vers inscription */}
          <p className="text-center mt-6 text-gray-600 text-sm">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="text-gray-900 font-medium hover:underline underline-offset-4"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}