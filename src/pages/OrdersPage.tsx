import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Package, ChevronRight } from "lucide-react"
import { OrderStatusBadge } from "@/components/orders"
import * as ordersService from "@/services/orders.service"
import type { OrderSummary } from "@/types"

/** Formate une date ISO en format court français */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await ordersService.getMyOrders()
        setOrders(data)
      } catch {
        // Erreur silencieuse — liste vide affichée
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrders()
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Mes commandes</h1>

      <div className="mt-8 space-y-4">
        {/* Loading */}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}

        {/* Liste vide */}
        {!isLoading && orders.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Package size={40} className="mx-auto text-gray-200" />
            <p className="mt-4 text-sm font-medium text-gray-600">
              Aucune commande pour le moment
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Vos commandes apparaîtront ici après votre premier achat.
            </p>
          </div>
        )}

        {/* Liste des commandes */}
        {!isLoading &&
          orders.map((order) => (
            <Link
              key={order.id}
              to={`/commandes/${order.id}`}
              className="group block rounded-2xl border border-gray-100 p-5 sm:p-6 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
            >
              {/* Ligne 1 : numéro + badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
                />
              </div>

              {/* Ligne 2 : date, articles, total */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-500">
                  <span>{formatDate(order.createdAt)}</span>
                  <span className="text-gray-300">·</span>
                  <span>
                    {order.itemCount} article{order.itemCount > 1 ? "s" : ""}
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  {order.total.toFixed(2)} €
                </span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  )
}

// ── Skeleton ────────────────────────────────────

function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 p-5 sm:p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-40 rounded bg-gray-100" />
          <div className="h-6 w-24 rounded-full bg-gray-100" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-3 w-44 rounded bg-gray-100" />
        <div className="h-4 w-20 rounded bg-gray-100" />
      </div>
    </div>
  )
}