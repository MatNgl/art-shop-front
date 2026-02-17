import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onSelect: (variant: ProductVariant) => void
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: VariantSelectorProps) {
  if (variants.length === 0) return null

  return (
    <div className="space-y-4">
      {/* ── Format ── */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Format
          {selectedVariant && (
            <span className="ml-2 font-normal normal-case text-gray-500">
              — {selectedVariant.format.widthMm}×{selectedVariant.format.heightMm}mm
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = selectedVariant?.id === variant.id
            const isUnavailable = variant.status !== 'AVAILABLE'

            return (
              <button
                key={variant.id}
                onClick={() => !isUnavailable && onSelect(variant)}
                disabled={isUnavailable}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150',
                  isSelected
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : isUnavailable
                      ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400',
                )}
              >
                <span>{variant.format.name}</span>
                <span className="ml-1.5 text-xs opacity-60">
                  {variant.material.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Prix et disponibilité ── */}
      {selectedVariant && (
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold text-gray-900">
            {Number(selectedVariant.price).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>

          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider',
              selectedVariant.status === 'AVAILABLE'
                ? 'bg-green-50 text-green-600'
                : selectedVariant.status === 'OUT_OF_STOCK'
                  ? 'bg-orange-50 text-orange-500'
                  : 'bg-gray-100 text-gray-400',
            )}
          >
            {selectedVariant.status === 'AVAILABLE'
              ? 'Disponible'
              : selectedVariant.status === 'OUT_OF_STOCK'
                ? 'Rupture de stock'
                : 'Abandonné'}
          </span>

          {selectedVariant.status === 'AVAILABLE' && selectedVariant.stockQty > 0 && selectedVariant.stockQty <= 5 && (
            <span className="text-xs text-orange-400">
              Plus que {selectedVariant.stockQty} en stock
            </span>
          )}
        </div>
      )}
    </div>
  )
}