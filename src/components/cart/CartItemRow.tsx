import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import type { CartItem } from '@/types'

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem, isLoading } = useCart()

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  return (
    <div className="flex gap-4 py-6 border-b border-gray-100 last:border-0">
      {/* Détails */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-1">
          {item.productName}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {item.formatName}{item.materialName ? ` · ${item.materialName}` : ''}
        </p>

        <p className="mt-1 text-sm font-medium text-gray-900">
          {item.unitPrice.toFixed(2)} €
        </p>

        {/* Contrôles quantité */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={handleDecrement}
              disabled={isLoading || item.quantity <= 1}
              className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Diminuer la quantité"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={isLoading}
              className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Augmenter la quantité"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
            aria-label="Supprimer l'article"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Total ligne */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-medium text-gray-900">
          {item.lineTotal.toFixed(2)} €
        </p>
      </div>
    </div>
  )
}