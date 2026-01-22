const API_BASE_URL = 'http://localhost:3000'

/** Clé de stockage du token dans localStorage */
export const TOKEN_KEY = 'art_shop_token'

/**
 * Client HTTP simple pour les appels API
 * Ajoute automatiquement le token JWT si présent
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Ajoute le token JWT si présent
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Parse la réponse JSON
  const data: unknown = await response.json().catch(() => null)

  // Gère les erreurs HTTP
  if (!response.ok) {
    const error = data as { message?: string | string[] }
    const message = Array.isArray(error?.message)
      ? error.message[0]
      : error?.message || 'Une erreur est survenue'
    throw new Error(message)
  }

  return data as T
}

/** GET request */
export function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' })
}

/** POST request */
export function post<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** PUT request */
export function put<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/** DELETE request */
export function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' })
}