import type { CartItem, OrderItem } from "@/types"

// ── Type normalisé pour l'affichage ─────────────

interface SummaryItem {
  id: string
  title: string
  detail: string
  imageUrl: string | null
  quantity: number
  lineTotal: number
}

interface OrderSummaryProps {
  items: SummaryItem[]
  subtotal: number
  total: number
}

// ── Mappers ─────────────────────────────────────

/** Convertit un CartItem (panier) en SummaryItem */
export function fromCartItem(item: CartItem): SummaryItem {
  return {
    id: item.id,
    title: item.productName,
    detail: [item.formatName, item.materialName].filter(Boolean).join(" · "),
    imageUrl: item.productImageUrl,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }
}

/** Convertit un OrderItem (commande) en SummaryItem */
export function fromOrderItem(item: OrderItem): SummaryItem {
  return {
    id: item.id,
    title: item.productTitleSnapshot,
    detail: [item.variantSnapshot.formatName, item.variantSnapshot.material]
      .filter(Boolean)
      .join(" · "),
    imageUrl: null,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }
}

// ── Composant ───────────────────────────────────

/**
 * Récapitulatif de commande normalisé.
 * Accepte des SummaryItem[] — utiliser fromCartItem() ou fromOrderItem()
 * pour convertir les données avant de les passer.
 */
export function OrderSummary({ items, subtotal, total }: OrderSummaryProps) {
  return (
    <div>
      {/* Liste des articles */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 py-5">
            {/* Miniature */}
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-20 w-20 shrink-0 rounded-xl object-cover bg-gray-50"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                <span className="text-[9px] uppercase tracking-widest text-gray-300">
                  Sans image
                </span>
              </div>
            )}

            {/* Détails */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {item.title}
              </p>
              {item.detail && (
                <p className="mt-0.5 text-xs text-gray-500">{item.detail}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Qté : {item.quantity}
              </p>
            </div>

            {/* Prix */}
            <p className="shrink-0 text-sm font-medium text-gray-900">
              {item.lineTotal.toFixed(2)} €
            </p>
          </div>
        ))}
      </div>

      {/* Totaux */}
      <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Sous-total</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Livraison</span>
          <span className="text-xs italic">Calculée à la prochaine étape</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  )
}

export function OrderSummarySkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
          <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
            <div className="h-3 w-12 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-14 shrink-0 rounded bg-gray-100" />
        </div>
      ))}
      <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-4 w-16 rounded bg-gray-100" />
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <div className="h-5 w-16 rounded bg-gray-100" />
          <div className="h-5 w-20 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}