import { MapPin, Pencil, Trash2, Star } from 'lucide-react'
import type { Address } from '@/types'

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <div
      className={`relative rounded-xl border p-5 transition-colors ${
        address.isDefault
          ? 'border-gray-900 bg-gray-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Badge par défaut */}
      {address.isDefault && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-medium">
          <Star size={10} fill="currentColor" />
          Par défaut
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-400">
          <MapPin size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {address.recipientName}
          </p>
          <p className="mt-1 text-sm text-gray-600">{address.line1}</p>
          {address.line2 && (
            <p className="text-sm text-gray-600">{address.line2}</p>
          )}
          <p className="text-sm text-gray-600">
            {address.postalCode} {address.city}
          </p>
          <p className="text-sm text-gray-500 uppercase">{address.country}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            Définir par défaut
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onEdit(address)}
          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
          aria-label="Modifier l'adresse"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Supprimer l'adresse"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}