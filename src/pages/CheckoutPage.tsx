import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ShoppingBag, MapPin, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCardIcon } from "@/components/ui/creditcard"
import type { CreditCardIconHandle } from "@/components/ui/creditcard"
import {
  CheckoutStepper,
  OrderSummary,
  OrderSummarySkeleton,
  AddressSelector,
  AddressSelectorSkeleton,
  fromCartItem,
  fromOrderItem,
} from "@/components/checkout"
import { AddressForm } from "@/components/profile"
import * as addressesService from "@/services/addresses.service"
import * as ordersService from "@/services/orders.service"
import * as paymentsService from "@/services/payments.service"
import type { Address, Order } from "@/types"
import type { AddressFormData } from "@/schemas"

// ── Clé sessionStorage pour la commande en cours ──

const PENDING_ORDER_KEY = "art_shop_pending_order"

// ── Configuration du stepper ────────────────────

const STEPS = [
  { label: "Récapitulatif" },
  { label: "Adresse" },
  { label: "Paiement" },
]

// ── Composant ───────────────────────────────────

export function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { cart, isLoading: cartLoading, refreshCart } = useCart()
  const creditCardRef = useRef<CreditCardIconHandle>(null)

  const stepParam = Number(searchParams.get("step")) || 1
  const initialStep = stepParam >= 1 && stepParam <= 3 ? stepParam : 1

  const [currentStep, setCurrentStep] = useState(initialStep)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isCreatingAddress, setIsCreatingAddress] = useState(false)

  // État pour la récupération d'une commande en attente (retour Stripe)
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const [pendingOrderLoading, setPendingOrderLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  // ── Synchroniser l'étape avec l'URL ──

  useEffect(() => {
    if (!pendingOrder) {
      setSearchParams({ step: String(currentStep) }, { replace: true })
    }
  }, [currentStep, setSearchParams, pendingOrder])

  // ── Détection d'une commande en attente (retour depuis Stripe) ──

  useEffect(() => {
    const cancelled = searchParams.get("cancelled")
    const storedOrderId = sessionStorage.getItem(PENDING_ORDER_KEY)

    if (cancelled === "true" && storedOrderId) {
      setPendingOrderLoading(true)

      void ordersService
        .getOrder(storedOrderId)
        .then((order) => {
          setPendingOrder(order)
        })
        .catch(() => {
          sessionStorage.removeItem(PENDING_ORDER_KEY)
          toast.error("Impossible de récupérer la commande")
        })
        .finally(() => {
          setPendingOrderLoading(false)
        })
    }
  }, [searchParams])

  // ── Calculs dérivés ──

  const items = cart?.items ?? []
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const total = subtotal

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null

  // ── Chargement des adresses (étape 2) ──

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true)
    try {
      const data = await addressesService.getAddresses()
      setAddresses(data)

      const defaultAddr = data.find((a) => a.isDefault)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id)
      }
    } catch {
      toast.error("Impossible de charger vos adresses")
    } finally {
      setAddressesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentStep === 2 && addresses.length === 0 && !pendingOrder) {
      void loadAddresses()
    }
  }, [currentStep, addresses.length, loadAddresses, pendingOrder])

  // ── Callback ajout adresse ──

  const handleAddressSubmit = async (data: AddressFormData) => {
    setIsCreatingAddress(true)
    try {
      const created = await addressesService.createAddress(data)
      setAddresses((prev) => [...prev, created])
      setSelectedAddressId(created.id)
      setShowAddressForm(false)
      toast.success("Adresse ajoutée")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de créer l'adresse"
      toast.error(message)
    } finally {
      setIsCreatingAddress(false)
    }
  }

  // ── Navigation stepper ──

  const goNext = () => {
    if (currentStep === 1 && items.length === 0) {
      toast.error("Votre panier est vide")
      return
    }
    if (currentStep === 2 && !selectedAddressId) {
      toast.error("Veuillez sélectionner une adresse de livraison")
      return
    }
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1)
      setShowAddressForm(false)
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
      setShowAddressForm(false)
    }
  }

  // ── Paiement (étape 3) ──

  const handlePayment = async () => {
    if (!selectedAddressId) return

    setIsProcessing(true)
    try {
      const order = await ordersService.createOrder({
        addressId: selectedAddressId,
      })

      sessionStorage.setItem(PENDING_ORDER_KEY, order.id)

      const { checkoutUrl } = await paymentsService.createCheckoutSession({
        orderId: order.id,
      })

      window.location.href = checkoutUrl
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du paiement"
      toast.error(message)
      setIsProcessing(false)
    }
  }

  // ── Relancer le paiement d'une commande en attente ──

  const handleRetryPayment = async () => {
    if (!pendingOrder) return

    setIsRetrying(true)
    try {
      const { checkoutUrl } = await paymentsService.createCheckoutSession({
        orderId: pendingOrder.id,
      })

      window.location.href = checkoutUrl
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de relancer le paiement"
      toast.error(message)

      sessionStorage.removeItem(PENDING_ORDER_KEY)
      setPendingOrder(null)
      refreshCart()
    } finally {
      setIsRetrying(false)
    }
  }

  // ── Loading commande en attente ──

  if (pendingOrderLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 animate-pulse">
        <Skeleton className="h-7 w-64 mb-8" />
        <div className="flex items-center w-full mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <Skeleton circle className="h-10 w-10" />
                <Skeleton className="h-3 w-16" />
              </div>
              {i < 3 && <div className="mx-4 h-px flex-1 bg-gray-100" />}
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  // ── Commande en attente (retour Stripe) ──

  if (pendingOrder) {
    const pendingItems = pendingOrder.items.map(fromOrderItem)

    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-gray-900">Finaliser la commande</h1>

        <div className="mt-8 mb-10">
          <CheckoutStepper steps={STEPS} currentStep={3} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Paiement non finalisé
              </p>
              <p className="mt-0.5 text-xs text-amber-600">
                Votre commande <span className="font-semibold">{pendingOrder.orderNumber}</span> est
                en attente de paiement. Vous pouvez réessayer ci-dessous.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
              Livraison à
            </p>
            <p className="text-sm font-medium text-gray-900">
              {pendingOrder.shippingAddressSnapshot.recipientName}
            </p>
            <p className="text-sm text-gray-600">
              {pendingOrder.shippingAddressSnapshot.line1}
            </p>
            {pendingOrder.shippingAddressSnapshot.line2 && (
              <p className="text-sm text-gray-600">
                {pendingOrder.shippingAddressSnapshot.line2}
              </p>
            )}
            <p className="text-sm text-gray-600">
              {pendingOrder.shippingAddressSnapshot.postalCode}{" "}
              {pendingOrder.shippingAddressSnapshot.city},{" "}
              {pendingOrder.shippingAddressSnapshot.country}
            </p>
          </div>

          <OrderSummary
            items={pendingItems}
            subtotal={pendingOrder.subtotal}
            total={pendingOrder.total}
          />

          <p className="mt-6 text-xs text-gray-400 text-center">
            Vous serez redirigé vers Stripe pour effectuer le paiement sécurisé.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem(PENDING_ORDER_KEY)
              navigate(`/commandes/${pendingOrder.id}`)
            }}
          >
            <ArrowLeft size={16} />
            Voir ma commande
          </Button>

          <Button
            size="lg"
            onClick={() => void handleRetryPayment()}
            onMouseEnter={() => creditCardRef.current?.startAnimation()}
            onMouseLeave={() => creditCardRef.current?.stopAnimation()}
            isLoading={isRetrying}
            disabled={isRetrying}
          >
            {!isRetrying && (
              <CreditCardIcon ref={creditCardRef} size={16} />
            )}
            Payer {pendingOrder.total.toFixed(2)} €
          </Button>
        </div>
      </div>
    )
  }

  // ── Panier vide ──

  if (!cartLoading && items.length === 0 && currentStep === 1) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-200" />
        <h1 className="mt-6 text-xl font-semibold text-gray-900">
          Votre panier est vide
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Explorez nos œuvres pour commencer votre collection.
        </p>
        <Button
          variant="default"
          size="lg"
          className="mt-8"
          onClick={() => navigate("/galerie")}
        >
          Voir le catalogue
        </Button>
      </div>
    )
  }

  // ── Items mappés pour le stepper ──

  const summaryItems = items.map(fromCartItem)

  // ── Rendu normal ──

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Finaliser la commande</h1>

      <div className="mt-8 mb-10">
        <CheckoutStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) {
              setCurrentStep(step)
              setShowAddressForm(false)
            }
          }}
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
        {currentStep === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag size={20} className="text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Votre commande
              </h2>
              <span className="ml-auto text-sm text-gray-400">
                {items.length} article{items.length > 1 ? "s" : ""}
              </span>
            </div>

            {cartLoading ? (
              <OrderSummarySkeleton />
            ) : (
              <OrderSummary
                items={summaryItems}
                subtotal={subtotal}
                total={total}
              />
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={20} className="text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Adresse de livraison
              </h2>
            </div>

            {addressesLoading ? (
              <AddressSelectorSkeleton />
            ) : showAddressForm ? (
              <AddressForm
                address={null}
                onSubmit={handleAddressSubmit}
                onClose={() => setShowAddressForm(false)}
                isLoading={isCreatingAddress}
              />
            ) : (
              <AddressSelector
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onAddNew={() => setShowAddressForm(true)}
              />
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <CreditCardIcon size={20} className="text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Confirmer et payer
              </h2>
            </div>

            {selectedAddress && (
              <div className="mb-6 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                  Livraison à
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedAddress.recipientName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAddress.line1}
                </p>
                {selectedAddress.line2 && (
                  <p className="text-sm text-gray-600">
                    {selectedAddress.line2}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  {selectedAddress.postalCode} {selectedAddress.city},{" "}
                  {selectedAddress.country}
                </p>
              </div>
            )}

            <OrderSummary
              items={summaryItems}
              subtotal={subtotal}
              total={total}
            />

            <p className="mt-6 text-xs text-gray-400 text-center">
              Vous serez redirigé vers Stripe pour effectuer le paiement sécurisé.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={currentStep === 1 ? () => navigate(-1) : goBack}
        >
          <ArrowLeft size={16} />
          {currentStep === 1 ? "Retour" : "Précédent"}
        </Button>

        {currentStep < 3 ? (
          <Button onClick={goNext}>
            Continuer
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => void handlePayment()}
            onMouseEnter={() => creditCardRef.current?.startAnimation()}
            onMouseLeave={() => creditCardRef.current?.stopAnimation()}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            {!isProcessing && (
              <CreditCardIcon ref={creditCardRef} size={16} />
            )}
            Payer {total.toFixed(2)} €
          </Button>
        )}
      </div>
    </div>
  )
}