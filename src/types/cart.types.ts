// src/types/cart.types.ts

/** Item dans le panier (retourné par l'API — DTO aplati) */
export interface CartItem {
  id: string
  productVariantId: string
  productName: string
  productSlug: string
  productImageUrl: string | null
  formatName: string
  materialName: string
  quantity: number
  unitPrice: number
  lineTotal: number
  createdAt: string
  updatedAt: string
}

/** Panier complet (retourné par GET /carts/me) */
export interface Cart {
  id: string
  userId: string
  status: string
  items: CartItem[]
  total: number
  itemCount: number
  createdAt: string
  updatedAt: string
  convertedAt: string | null
}

/** Réponse de POST /carts/guest/items */
export interface GuestCartResponse {
  cart: Cart
  accessToken: string
}

/** DTO pour ajouter un article */
export interface AddCartItemPayload {
  productVariantId: string
  quantity: number
}

/** DTO pour modifier la quantité */
export interface UpdateCartItemPayload {
  quantity: number
}

/** Panier admin (retourné par GET /carts/admin/active) */
export interface AdminCartSummary {
  id: string
  userId: string
  userEmail: string
  userDisplayName?: string
  isGuest: boolean
  status: string
  items: CartItem[]
  total: number
  itemCount: number
  createdAt: string
  updatedAt: string
}