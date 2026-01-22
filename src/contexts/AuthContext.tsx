import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TOKEN_KEY } from '@/services/api'
import * as authService from '@/services/auth.service'
import type { User, LoginPayload, RegisterPayload } from '@/types'

/** État du contexte d'authentification */
interface AuthContextState {
  /** Utilisateur connecté (null si non connecté) */
  user: User | null
  /** Indique si l'utilisateur est connecté */
  isAuthenticated: boolean
  /** Indique si la vérification initiale du token est en cours */
  isLoading: boolean
  /** Connecte l'utilisateur */
  login: (payload: LoginPayload) => Promise<void>
  /** Inscrit un nouvel utilisateur */
  register: (payload: RegisterPayload) => Promise<void>
  /** Déconnecte l'utilisateur */
  logout: () => Promise<void>
}

/** Contexte d'authentification */
export const AuthContext = createContext<AuthContextState | null>(null)

/** Provider du contexte d'authentification */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifie si un token existe au chargement de l'app
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY)

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Vérifie que le token est toujours valide
        const currentUser = await authService.getMe()
        setUser(currentUser)
      } catch {
        // Token invalide ou expiré → on le supprime
        localStorage.removeItem(TOKEN_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    void initAuth()
  }, [])

  /** Connexion */
  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload)

    // Stocke le token dans localStorage
    localStorage.setItem(TOKEN_KEY, response.accessToken)

    // Met à jour l'état
    setUser(response.user)
  }, [])

  /** Inscription */
  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)

    // Stocke le token dans localStorage
    localStorage.setItem(TOKEN_KEY, response.accessToken)

    // Met à jour l'état
    setUser(response.user)
  }, [])

  /** Déconnexion */
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore les erreurs (token peut être déjà expiré)
    } finally {
      // Supprime le token et réinitialise l'état
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    }
  }, [])

  // Mémorise la valeur du contexte pour éviter les re-renders inutiles
  const value = useMemo<AuthContextState>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}