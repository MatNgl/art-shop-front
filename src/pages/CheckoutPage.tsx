import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingBag, MapPin, CreditCard, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/hooks"
import { Button } from "@/components/ui/button"
import {
  CheckoutStepper,
  OrderSummary,
  OrderSummarySkeleton,
  AddressSelector,
  AddressSelectorSkeleton,
} from "@/components/checkout"
import { AddressForm } from "@/components/profile"
import * as addressesService from "@/services/addresses.service"
import * as ordersService from "@/services/orders.service"
import * as paymentsService from "@/services/payments.service"
import type { Address } from "@/types"
import type { AddressFormData } from "@/schemas"

// ── Configuration du stepper ────────────────────

const STEPS = [
  { label: "Récapitulatif" },
  { label: "Adresse" },
  { label: "Paiement" },
]

// ── Composant ───────────────────────────────────

export function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, isLoading: cartLoading } = useCart()

  const [currentStep, setCurrentStep] = useState(1)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isCreatingAddress, setIsCreatingAddress] = useState(false)

  // ── Calculs dérivés ──

  const items = cart?.items ?? []
  const subtotal = items.reduce(
    (sum, item) => sum + item.lineTotal,
    0,
  )
  const total = subtotal // Promotions en V2

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null

  // ── Chargement des adresses (étape 2) ──

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true)
    try {
      const data = await addressesService.getAddresses()
      setAddresses(data)

      // Pré-sélectionner l'adresse par défaut
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
    if (currentStep === 2 && addresses.length === 0) {
      void loadAddresses()
    }
  }, [currentStep, addresses.length, loadAddresses])

  // ── Callback ajout adresse (via le formulaire profil réutilisé) ──

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
      // 1. Créer la commande depuis le panier
      const order = await ordersService.createOrder({
        addressId: selectedAddressId,
      })

      // 2. Créer la session Stripe Checkout
      const { checkoutUrl } = await paymentsService.createCheckoutSession({
        orderId: order.id,
      })

      // 3. Rediriger vers Stripe
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
          className="mt-8 cursor-pointer"
          onClick={() => navigate("/galerie")}
        >
          Voir le catalogue
        </Button>
      </div>
    )
  }

  // ── Rendu ──

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Titre */}
      <h1 className="text-2xl font-semibold text-gray-900">Finaliser la commande</h1>

      {/* Stepper */}
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

      {/* Contenu de l'étape */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
        {/* ÉTAPE 1 — Récapitulatif */}
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
                items={items}
                subtotal={subtotal}
                total={total}
              />
            )}
          </div>
        )}

        {/* ÉTAPE 2 — Adresse de livraison */}
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

        {/* ÉTAPE 3 — Paiement */}
        {currentStep === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <CreditCard size={20} className="text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Confirmer et payer
              </h2>
            </div>

            {/* Résumé adresse sélectionnée */}
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

            {/* Résumé articles */}
            <OrderSummary
              items={items}
              subtotal={subtotal}
              total={total}
            />

            {/* Info redirection Stripe */}
            <p className="mt-6 text-xs text-gray-400 text-center">
              Vous serez redirigé vers Stripe pour effectuer le paiement sécurisé.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={currentStep === 1 ? () => navigate(-1) : goBack}
        >
          <ArrowLeft size={16} />
          {currentStep === 1 ? "Retour" : "Précédent"}
        </Button>

        {currentStep < 3 ? (
          <Button className="cursor-pointer" onClick={goNext}>
            Continuer
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            size="lg"
            className="cursor-pointer"
            onClick={() => void handlePayment()}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            {!isProcessing && <CreditCard size={16} />}
            Payer {total.toFixed(2)} €
          </Button>
        )}
      </div>
    </div>
  )
}