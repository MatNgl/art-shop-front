import { get, post, patch, del } from './api'
import type {
  Cart,
  GuestCartResponse,
  AddCartItemPayload,
} from '@/types'

/**
 * Récupère le panier actif de l'utilisateur connecté
 * GET /carts/me
 */
export async function getActiveCart(): Promise<Cart | null> {
  try {
    return await get<Cart>('/carts/me')
  } catch {
    return null
  }
}

/**
 * Ajoute un article au panier (utilisateur connecté)
 * POST /carts/items
 */
export async function addItem(payload: AddCartItemPayload): Promise<Cart> {
  return post<Cart>('/carts/items', payload)
}

/**
 * Ajoute un article en tant qu'invité (retourne un JWT)
 * POST /carts/guest/items
 */
export async function addItemAsGuest(
  payload: AddCartItemPayload,
): Promise<GuestCartResponse> {
  return post<GuestCartResponse>('/carts/guest/items', payload)
}

/**
 * Modifie la quantité d'un article
 * PATCH /carts/items/:itemId
 */
export async function updateItemQuantity(
  itemId: string,
  payload: { quantity: number },
): Promise<Cart> {
  return patch<Cart>(`/carts/items/${itemId}`, payload)
}

/**
 * Supprime un article du panier
 * DELETE /carts/items/:itemId
 */
export async function removeItem(itemId: string): Promise<Cart> {
  return del<Cart>(`/carts/items/${itemId}`)
}

/**
 * Vide le panier
 * DELETE /carts/items
 */
export async function clearCart(): Promise<Cart> {
  return del<Cart>('/carts/items')
}