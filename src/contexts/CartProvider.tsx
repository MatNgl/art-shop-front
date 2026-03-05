import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { TOKEN_KEY } from '@/services/api'
import * as cartService from '@/services/cart.service'
import { CartContext, type CartContextType } from './cartContext'
import type { AddCartItemPayload } from '@/types'
import { toast } from 'sonner'
import { useAuth } from '@/hooks'

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartContextType['cart']>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const itemCount = cart?.itemCount ?? 0
  const total = cart?.total ?? 0

  // ── Rafraîchir le panier ──────────────────────
  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setCart(null)
      return
    }

    try {
      const activeCart = await cartService.getActiveCart()
      setCart(activeCart)
    } catch {
      setCart(null)
    }
  }, [])

  // ── Vider le state local (après paiement) ─────
  const resetCart = useCallback(() => {
    setCart(null)
  }, [])

  // ── Synchro avec l'état d'authentification ────
  useEffect(() => {
    if (!authLoading) {
      void refreshCart()
    }
  }, [isAuthenticated, authLoading, refreshCart])

  // ── Synchro multi-onglets (StorageEvent) ──────
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        void refreshCart()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [refreshCart])

  // ── Ajouter un article ────────────────────────
  const addItem = useCallback(
    async (payload: AddCartItemPayload) => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem(TOKEN_KEY)

        if (token) {
          const updatedCart = await cartService.addItem(payload)
          setCart(updatedCart)
        } else {
          const response = await cartService.addItemAsGuest(payload)
          localStorage.setItem(TOKEN_KEY, response.accessToken)
          setCart(response.cart)
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erreur lors de l'ajout"
        toast.error(message)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // ── Modifier la quantité ──────────────────────
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      setIsLoading(true)
      try {
        const updatedCart = await cartService.updateItemQuantity(itemId, {
          quantity,
        })
        setCart(updatedCart)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erreur lors de la modification'
        toast.error(message)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // ── Supprimer un article ──────────────────────
  const removeItem = useCallback(
    async (itemId: string) => {
      setIsLoading(true)
      try {
        const updatedCart = await cartService.removeItem(itemId)
        setCart(updatedCart)
        toast.success('Article retiré du panier')
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erreur lors de la suppression'
        toast.error(message)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // ── Vider le panier ───────────────────────────
  const clearCart = useCallback(async () => {
    setIsLoading(true)
    try {
      const updatedCart = await cartService.clearCart()
      setCart(updatedCart)
      toast.success('Panier vidé')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur lors du vidage'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: CartContextType = {
    cart,
    isLoading,
    itemCount,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    resetCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}