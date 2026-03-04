// src/components/profile/AddressForm.tsx — version refactorée

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { addressSchema, type AddressFormData } from '@/schemas'
import { AddressAutocomplete } from '@/components/profile'
import { FormInput } from '@/components/forms'
import type { Address, ParsedAddress } from '@/types'

interface AddressFormProps {
  address: Address | null
  onSubmit: (data: AddressFormData) => Promise<void>
  onClose: () => void
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

  function handleAddressSelect(parsed: ParsedAddress) {
    setValue('line1', parsed.line1, { shouldValidate: true })
    setValue('postalCode', parsed.postalCode, { shouldValidate: true })
    setValue('city', parsed.city, { shouldValidate: true })
  }

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
        <FormInput
          label="Nom du destinataire"
          placeholder="Jean Dupont"
          error={errors.recipientName?.message}
          {...register('recipientName')}
        />

        {/* Autocomplete adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Adresse ligne 1 */}
        <FormInput
          label="Adresse"
          placeholder="12 rue de la Paix"
          error={errors.line1?.message}
          {...register('line1')}
        />

        {/* Complément d'adresse */}
        <FormInput
          label="Complément d'adresse (optionnel)"
          placeholder="Bâtiment A, 3ème étage"
          error={errors.line2?.message}
          {...register('line2')}
        />

        {/* Code postal + Ville */}
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="Code postal"
            placeholder="75001"
            error={errors.postalCode?.message}
            {...register('postalCode')}
          />

          <div className="col-span-2">
            <FormInput
              label="Ville"
              placeholder="Paris"
              error={errors.city?.message}
              {...register('city')}
            />
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