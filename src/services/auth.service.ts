import { get, post } from './api'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types'

/**
 * Connexion utilisateur
 * POST /auth/login
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/login', payload)
}

/**
 * Inscription utilisateur
 * POST /auth/register
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/register', payload)
}

/**
 * Récupère le profil de l'utilisateur connecté
 * GET /auth/me
 */
export async function getMe(): Promise<User> {
  return get<User>('/auth/me')
}

/**
 * Déconnexion
 * POST /auth/logout
 */
export async function logout(): Promise<{ message: string }> {
  return post<{ message: string }>('/auth/logout', {})
}