/** Rôle utilisateur */
export interface Role {
  id: string
  code: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'GUEST'
  label: string
  createdAt: string
}

/** Utilisateur (réponse API sans passwordHash) */
export interface User {
  id: string
  email: string
  roleId: string
  role: Role
  firstName?: string
  lastName?: string
  displayName?: string
  phone?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  authProvider: 'LOCAL' | 'GOOGLE'
  googleId?: string
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

/** Réponse de /auth/login et /auth/register */
export interface AuthResponse {
  accessToken: string
  user: User
}

/** Payload pour /auth/login */
export interface LoginPayload {
  email: string
  password: string
}

/** Payload pour /auth/register */
export interface RegisterPayload {
  email: string
  password: string
  confirmPassword: string
}

/** Réponse d'erreur API */
export interface ApiError {
  message: string | string[]
  error?: string
  statusCode: number
}