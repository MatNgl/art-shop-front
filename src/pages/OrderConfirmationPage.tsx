import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle2, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/hooks"
import * as ordersService from "@/services/orders.service"
import type { Order } from "@/types"

const PENDING_ORDER_KEY = "art_shop_pending_order"

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { resetCart } = useCart()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      navigate("/galerie")
      return
    }

    // Vider le panier local et nettoyer le sessionStorage
    resetCart()
    sessionStorage.removeItem(PENDING_ORDER_KEY)

    const loadOrder = async () => {
      try {
        const data = await ordersService.getOrder(id)
        setOrder(data)
      } catch {
        setError("Impossible de charger la commande")
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrder()
  }, [id, navigate, resetCart])

  // ── Loading ──

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center animate-pulse">
        <Skeleton circle className="mx-auto h-16 w-16" />
        <Skeleton className="mx-auto mt-6 h-7 w-64" />
        <Skeleton className="mx-auto mt-3 h-4 w-80" />
        <Skeleton className="mx-auto mt-8 h-24 w-full rounded-2xl" />
      </div>
    )
  }

  // ── Erreur ──

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-sm text-gray-500">{error ?? "Commande introuvable"}</p>
        <Button
          variant="default"
          className="mt-6"
          onClick={() => navigate("/galerie")}
        >
          Retour au catalogue
        </Button>
      </div>
    )
  }

  // ── Confirmation ──

  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      {/* Icône succès */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">
          Commande confirmée !
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Merci pour votre achat. Votre commande{" "}
          <span className="font-medium text-gray-700">{order.orderNumber}</span>{" "}
          a bien été enregistrée.
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="mt-10 rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-gray-400" />
          <h2 className="text-sm font-medium text-gray-900">
            Détails de la commande
          </h2>
        </div>

        {/* Articles */}
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {item.productTitleSnapshot}
                </p>
                <p className="text-xs text-gray-500">
                  {item.variantSnapshot.formatName} ·{" "}
                  {item.variantSnapshot.material} · Qté : {item.quantity}
                </p>
              </div>
              <p className="shrink-0 ml-4 text-sm font-medium text-gray-900">
                {item.lineTotal.toFixed(2)} €
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 border-t border-gray-100 pt-4 flex justify-between">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-sm font-semibold text-gray-900">
            {order.total.toFixed(2)} €
          </span>
        </div>

        {/* Adresse */}
        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
            Adresse de livraison
          </p>
          <p className="text-sm text-gray-700">
            {order.shippingAddressSnapshot.recipientName}
          </p>
          <p className="text-sm text-gray-600">
            {order.shippingAddressSnapshot.line1}
          </p>
          {order.shippingAddressSnapshot.line2 && (
            <p className="text-sm text-gray-600">
              {order.shippingAddressSnapshot.line2}
            </p>
          )}
          <p className="text-sm text-gray-600">
            {order.shippingAddressSnapshot.postalCode}{" "}
            {order.shippingAddressSnapshot.city},{" "}
            {order.shippingAddressSnapshot.country}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          variant="default"
          onClick={() => navigate(`/commandes/${order.id}`)}
        >
          Suivre ma commande
          <ArrowRight size={16} />
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/galerie")}
        >
          Continuer mes achats
        </Button>
      </div>
    </div>
  )
}