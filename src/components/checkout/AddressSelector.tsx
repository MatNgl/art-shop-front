import { MapPin, Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Address } from "@/types"

interface AddressSelectorProps {
  addresses: Address[]
  selectedId: string | null
  onSelect: (addressId: string) => void
  onAddNew: () => void
  isLoading?: boolean
}

/**
 * Sélecteur d'adresse pour le checkout.
 * Affiche les adresses de l'utilisateur sous forme de cartes cliquables
 * avec un bouton pour en ajouter une nouvelle.
 */
export function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  isLoading = false,
}: AddressSelectorProps) {
  if (isLoading) {
    return <AddressSelectorSkeleton />
  }

  if (addresses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
          <MapPin size={24} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-600">
            Aucune adresse enregistrée
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Ajoutez une adresse pour continuer votre commande.
          </p>
        </div>

        {/* Bouton ajouter (affiché même sans adresses) */}
        <button
          type="button"
          onClick={onAddNew}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-4 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700 cursor-pointer transition-all duration-200"
        >
          <Plus size={18} />
          Ajouter une adresse
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {addresses.map((address) => {
        const isSelected = address.id === selectedId

        return (
          <button
            key={address.id}
            type="button"
            onClick={() => onSelect(address.id)}
            className={cn(
              "relative w-full rounded-2xl border-2 p-5 text-left cursor-pointer transition-all duration-200",
              isSelected
                ? "border-gray-900 bg-gray-50/50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/30",
            )}
          >
            {/* Indicateur de sélection */}
            <div
              className={cn(
                "absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
                isSelected
                  ? "bg-gray-900 text-white"
                  : "border-2 border-gray-200",
              )}
            >
              {isSelected && <Check size={14} strokeWidth={2.5} />}
            </div>

            {/* Contenu adresse */}
            <div className="pr-10">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {address.recipientName}
                </p>
                {address.isDefault && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                    Par défaut
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">{address.line1}</p>
              {address.line2 && (
                <p className="text-sm text-gray-600">{address.line2}</p>
              )}
              <p className="text-sm text-gray-600">
                {address.postalCode} {address.city}, {address.country}
              </p>
            </div>
          </button>
        )
      })}

      {/* Bouton ajouter une adresse */}
      <button
        type="button"
        onClick={onAddNew}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-4 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700 cursor-pointer transition-all duration-200"
      >
        <Plus size={18} />
        Ajouter une adresse
      </button>
    </div>
  )
}

export function AddressSelectorSkeleton() {
  return (
    <div className="grid gap-3 animate-pulse">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border-2 border-gray-100 p-5 space-y-2"
        >
          <div className="h-4 w-1/3 rounded bg-gray-100" />
          <div className="h-3.5 w-3/4 rounded bg-gray-100" />
          <div className="h-3.5 w-1/2 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}