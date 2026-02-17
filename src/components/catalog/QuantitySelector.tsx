import { useState } from 'react'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types'

interface QuantitySelectorProps {
  variant: ProductVariant
  productName: string // ← ajout
  onAddToCart: (variant: ProductVariant, quantity: number) => void
  className?: string
}

export function QuantitySelector({
  variant,
  productName,
  onAddToCart,
  className,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(0)
  const [loading, setLoading] = useState(false)

  const maxQty = variant.stockQty > 0 ? variant.stockQty : 99
  const isUnavailable = variant.status !== 'AVAILABLE'

  function increment(): void {
    if (quantity < maxQty) {
      setQuantity((q) => q + 1)
    } else {
      toast.warning(`Stock maximum atteint (${maxQty})`)
    }
  }

  function decrement(): void {
    setQuantity((q) => Math.max(0, q - 1))
  }

  async function handleAddToCart(): Promise<void> {
    const qty = quantity === 0 ? 1 : quantity
    if (quantity === 0) setQuantity(1)

    setLoading(true)
    try {
      await Promise.resolve(onAddToCart(variant, qty))
      toast.success(
        qty > 1
          ? `${qty} articles ajoutés au panier`
          : 'Ajouté au panier',
        {
          description: `${productName} — ${variant.format.name} · ${variant.material.name}`,
        },
      )
    } catch {
      toast.error("Impossible d'ajouter au panier")
      if (quantity === 0) setQuantity(0)
    } finally {
      setLoading(false)
    }
  }

  if (isUnavailable) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-xl bg-gray-100 py-4 text-sm font-medium text-gray-400"
      >
        Indisponible
      </button>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Contrôles quantité */}
      {quantity > 0 && (
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 p-1">
          <button
            onClick={decrement}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Diminuer la quantité"
          >
            <Minus size={16} />
          </button>

          <span className="w-8 text-center text-sm font-semibold text-gray-900">
            {quantity}
          </span>

          <button
            onClick={increment}
            disabled={quantity >= maxQty}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Augmenter la quantité"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {/* Bouton principal */}
      <button
        onClick={() => void handleAddToCart()}
        disabled={loading}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all duration-200',
          'bg-gray-900 text-white hover:bg-gray-700',
          loading && 'cursor-not-allowed opacity-70',
        )}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <ShoppingBag size={16} />
        )}
        {quantity === 0 ? 'Ajouter au panier' : 'Mettre à jour le panier'}
      </button>
    </div>
  )
}