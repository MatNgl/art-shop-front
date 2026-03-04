import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { addressSchema, type AddressFormData } from '@/schemas/address.schema'
import { AddressAutocomplete } from '@/components/profile/AddressAutocomplete'
import type { Address } from '@/types'
import type { ParsedAddress } from '@/types/geocoding.types'

interface AddressFormProps {
  /** Adresse à modifier (null pour création) */
  address: Address | null
  /** Callback de soumission */
  onSubmit: (data: AddressFormData) => Promise<void>
  /** Fermer le formulaire */
  onClose: () => void
  /** Chargement en cours */
  isLoading?: boolean
}

export function AddressForm({
  address,
  onSubmit,
  onClose,
  isLoading = false,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: address?.recipientName ?? '',
      line1: address?.line1 ?? '',
      line2: address?.line2 ?? '',
      postalCode: address?.postalCode ?? '',
      city: address?.city ?? '',
      country: address?.country ?? 'FR',
      isDefault: address?.isDefault ?? false,
    },
  })

  /**
   * Callback de l'autocomplete — remplit automatiquement
   * line1, postalCode et city depuis la suggestion sélectionnée.
   * L'utilisateur peut toujours corriger manuellement après.
   */
  function handleAddressSelect(parsed: ParsedAddress) {
    setValue('line1', parsed.line1, { shouldValidate: true })
    setValue('postalCode', parsed.postalCode, { shouldValidate: true })
    setValue('city', parsed.city, { shouldValidate: true })
  }

  /**
   * Construit la valeur initiale de l'autocomplete en mode édition
   * pour que l'utilisateur voie son adresse existante.
   */
  function getInitialAutocompleteValue(): string {
    if (!address) return ''
    return `${address.line1} ${address.postalCode} ${address.city}`.trim()
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          {address ? "Modifier l'adresse" : 'Nouvelle adresse'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
          aria-label="Fermer le formulaire"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nom du destinataire */}
        <div>
          <label
            htmlFor="recipientName"
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Nom du destinataire
          </label>
          <input
            id="recipientName"
            type="text"
            placeholder="Jean Dupont"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            {...register('recipientName')}
          />
          {errors.recipientName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.recipientName.message}
            </p>
          )}
        </div>

        
        {/* Autocomplete adresse (API Géoplateforme IGN) */}
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Recherche d'adresse
            <span className="ml-1 text-gray-300 font-normal">
              (suggestions automatiques)
            </span>
          </label>
          <AddressAutocomplete
            onSelect={handleAddressSelect}
            initialValue={getInitialAutocompleteValue()}
            placeholder="Tapez une adresse pour la rechercher..."
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Sélectionnez une suggestion pour remplir automatiquement les champs
            ci-dessous
          </p>
        </div>

        {/* Adresse ligne 1 (pré-remplie par l'autocomplete) */}
        <div>
          <label
            htmlFor="line1"
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Adresse
          </label>
          <input
            id="line1"
            type="text"
            placeholder="12 rue de la Paix"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            {...register('line1')}
          />
          {errors.line1 && (
            <p className="mt-1 text-xs text-red-500">{errors.line1.message}</p>
          )}
        </div>

        {/* Adresse ligne 2 */}
        <div>
          <label
            htmlFor="line2"
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Complément d'adresse
            <span className="ml-1 text-gray-300 font-normal">(optionnel)</span>
          </label>
          <input
            id="line2"
            type="text"
            placeholder="Bâtiment A, 3ème étage"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            {...register('line2')}
          />
          {errors.line2 && (
            <p className="mt-1 text-xs text-red-500">{errors.line2.message}</p>
          )}
        </div>

        {/* Code postal + Ville (pré-remplis par l'autocomplete) */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="postalCode"
              className="block text-xs font-medium text-gray-500 mb-1.5"
            >
              Code postal
            </label>
            <input
              id="postalCode"
              type="text"
              placeholder="75001"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
              {...register('postalCode')}
            />
            {errors.postalCode && (
              <p className="mt-1 text-xs text-red-500">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label
              htmlFor="city"
              className="block text-xs font-medium text-gray-500 mb-1.5"
            >
              Ville
            </label>
            <input
              id="city"
              type="text"
              placeholder="Paris"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
              {...register('city')}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
            )}
          </div>
        </div>

        

        {/* Adresse par défaut */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
            {...register('isDefault')}
          />
          <span className="text-sm text-gray-600">
            Définir comme adresse par défaut
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading
              ? 'Enregistrement...'
              : address
                ? 'Modifier'
                : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}