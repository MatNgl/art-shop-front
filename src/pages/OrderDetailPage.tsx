import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderStatusBadge, OrderTimeline, OrderTimelineSkeleton } from "@/components/orders"
import * as ordersService from "@/services/orders.service"
import { OrderStatus } from "@/types"
import type { Order } from "@/types"

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadOrder = async () => {
      try {
        const data = await ordersService.getOrder(id)
        setOrder(data)
      } catch {
        toast.error("Impossible de charger la commande")
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrder()
  }, [id])

  // ── Annulation ──

  const handleCancel = async () => {
    if (!order) return

    setIsCancelling(true)
    try {
      const updated = await ordersService.cancelOrder(order.id)
      setOrder(updated)
      toast.success("Commande annulée")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible d'annuler la commande"
      toast.error(message)
    } finally {
      setIsCancelling(false)
    }
  }

  const canCancel =
    order?.status === OrderStatus.PENDING ||
    order?.status === OrderStatus.CONFIRMED

  // ── Loading ──

  if (isLoading) {
    return <OrderDetailSkeleton />
  }

  // ── Erreur ──

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm text-gray-500">Commande introuvable</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate("/commandes")}
        >
          Retour aux commandes
        </Button>
      </div>
    )
  }

  // ── Rendu ──

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/commandes")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Mes commandes
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Passée le{" "}
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleCancel()}
            isLoading={isCancelling}
            disabled={isCancelling}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            Annuler
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <section className="rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">Articles</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.productTitleSnapshot}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.variantSnapshot.formatName} ·{" "}
                      {item.variantSnapshot.material}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.unitPrice.toFixed(2)} € × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 ml-4 text-sm font-medium text-gray-900">
                    {item.lineTotal.toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span>
                <span>{order.subtotal.toFixed(2)} €</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Réduction</span>
                  <span>-{order.discountTotal.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{order.total.toFixed(2)} €</span>
              </div>
            </div>
          </section>

          {/* Tracking */}
          {order.shipments.length > 0 && (
            <section className="rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={18} className="text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900">Suivi de livraison</h2>
              </div>

              <div className="space-y-4">
                {order.shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="rounded-xl bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {shipment.carrier}
                      </p>
                      <OrderStatusBadge
                        status={shipment.status as OrderStatus}
                      />
                    </div>

                    {shipment.trackingNumber && (
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          N° suivi :{" "}
                          <span className="font-mono text-gray-700">
                            {shipment.trackingNumber}
                          </span>
                        </p>
                        <a
                          href={`https://www.laposte.fr/outils/suivre-vos-envois?code=${shipment.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Suivre sur le site du transporteur"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}

                    {shipment.shippedAt && (
                      <p className="mt-1 text-xs text-gray-500">
                        Expédié le{" "}
                        {new Date(shipment.shippedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    )}

                    {shipment.deliveredAt && (
                      <p className="text-xs text-gray-500">
                        Livré le{" "}
                        {new Date(shipment.deliveredAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Adresse */}
          <section className="rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">Livraison</h2>
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shippingAddressSnapshot.recipientName}
              </p>
              <p>{order.shippingAddressSnapshot.line1}</p>
              {order.shippingAddressSnapshot.line2 && (
                <p>{order.shippingAddressSnapshot.line2}</p>
              )}
              <p>
                {order.shippingAddressSnapshot.postalCode}{" "}
                {order.shippingAddressSnapshot.city},{" "}
                {order.shippingAddressSnapshot.country}
              </p>
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Historique
            </h2>
            <OrderTimeline history={order.statusHistory} />
          </section>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ────────────────────────────────────

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 animate-pulse">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-4 w-40" />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 p-6 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between py-4 border-b border-gray-100 last:border-0">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 p-6 space-y-2">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <OrderTimelineSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}