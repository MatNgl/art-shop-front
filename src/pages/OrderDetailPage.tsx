import { useState, useEffect, useRef } from "react"
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
import { CreditCardIcon } from "@/components/ui/creditcard"
import type { CreditCardIconHandle } from "@/components/ui/creditcard"
import { OrderStatusBadge, OrderTimeline, OrderTimelineSkeleton } from "@/components/orders"
import * as ordersService from "@/services/orders.service"
import * as paymentsService from "@/services/payments.service"
import { OrderStatus, ShipmentStatus } from "@/types"
import type { Order, Shipment } from "@/types"
import { cn } from "@/lib/utils"

//  Badge dédié pour les statuts de shipment 

const SHIPMENT_STATUS_CONFIG: Record<
  ShipmentStatus,
  { label: string; className: string }
> = {
  [ShipmentStatus.PENDING]: {
    label: "En préparation",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  [ShipmentStatus.SHIPPED]: {
    label: "Expédié",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  [ShipmentStatus.DELIVERED]: {
    label: "Livré",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  [ShipmentStatus.CANCELLED]: {
    label: "Annulé",
    className: "bg-gray-50 text-gray-500 ring-gray-200",
  },
}

function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  const config = SHIPMENT_STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

//  Composant principal ─

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const creditCardRef = useRef<CreditCardIconHandle>(null)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)

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

  //  Payer une commande PENDING 

  const handlePay = async () => {
    if (!order) return

    setIsPaying(true)
    try {
      const { checkoutUrl } = await paymentsService.createCheckoutSession({
        orderId: order.id,
      })

      sessionStorage.setItem("art_shop_pending_order", order.id)
      window.location.href = checkoutUrl
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de lancer le paiement"
      toast.error(message)
      setIsPaying(false)
    }
  }

  const isPending = order?.status === OrderStatus.PENDING

  //  Loading 

  if (isLoading) {
    return <OrderDetailSkeleton />
  }

  //  Erreur 

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

  //  Rendu 

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/commandes")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Mes commandes
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Bouton payer si PENDING */}
          {isPending && (
            <Button
              size="lg"
              onClick={() => void handlePay()}
              onMouseEnter={() => creditCardRef.current?.startAnimation()}
              onMouseLeave={() => creditCardRef.current?.stopAnimation()}
              isLoading={isPaying}
              disabled={isPaying}
            >
              {!isPaying && (
                <CreditCardIcon ref={creditCardRef} size={16} />
              )}
              Payer {order.total.toFixed(2)} €
            </Button>
          )}
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

      {/* Alerte paiement en attente */}
      {isPending && (
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
          <CreditCardIcon size={20} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Paiement en attente
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              Cette commande n'a pas encore été payée. Cliquez sur le bouton ci-dessus pour finaliser votre achat.
            </p>
          </div>
        </div>
      )}

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
                {order.shipments.map((shipment: Shipment) => (
                  <div
                    key={shipment.id}
                    className="rounded-xl bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {shipment.carrier}
                      </p>
                      <ShipmentStatusBadge status={shipment.status} />
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
                          href={getTrackingUrl(shipment.carrier, shipment.trackingNumber)}
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

//  URL de tracking par transporteur 

function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const carrierLower = carrier.toLowerCase()

  if (carrierLower.includes("colissimo") || carrierLower.includes("poste")) {
    return `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`
  }
  if (carrierLower.includes("chronopost")) {
    return `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${trackingNumber}`
  }
  if (carrierLower.includes("ups")) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`
  }
  if (carrierLower.includes("dhl")) {
    return `https://www.dhl.com/fr-fr/home/suivi.html?tracking-id=${trackingNumber}`
  }
  if (carrierLower.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
  }
  if (carrierLower.includes("mondial relay") || carrierLower.includes("mondial")) {
    return `https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=${trackingNumber}`
  }

  return `https://www.google.com/search?q=${encodeURIComponent(carrier)}+suivi+${trackingNumber}`
}

//  Skeleton 

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