import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, MapPin, Plus, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks'
import { AddressCard, AddressForm } from '@/components/profile'
import * as addressesService from '@/services/addresses.service'
import type { Address, AddressPayload } from '@/types'
import type { AddressFormData } from '@/schemas'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  // Chargement des adresses
  
  const loadAddresses = useCallback(async () => {
    try {
      const data = await addressesService.getAddresses()
      setAddresses(data)
    } catch {
      toast.error('Impossible de charger les adresses')
    } finally {
      setIsLoadingAddresses(false)
    }
  }, [])

  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  
  // Handlers adresses
  
  const handleSubmitAddress = async (data: AddressFormData) => {
    setIsSubmitting(true)
    try {
      const payload: AddressPayload = {
        ...data,
        line2: data.line2 || undefined,
      }

      if (editingAddress) {
        await addressesService.updateAddress(editingAddress.id, payload)
        toast.success('Adresse modifiée')
      } else {
        await addressesService.createAddress(payload)
        toast.success('Adresse ajoutée')
      }

      setShowForm(false)
      setEditingAddress(null)
      await loadAddresses()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await addressesService.deleteAddress(id)
      toast.success('Adresse supprimée')
      await loadAddresses()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Impossible de supprimer'
      toast.error(message)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await addressesService.setDefaultAddress(id)
      toast.success('Adresse par défaut mise à jour')
      await loadAddresses()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      toast.error(message)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  
  // Rendu
  
  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Section Profil */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <User size={18} className="text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Mon profil</h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Prénom
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.firstName || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Nom
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.lastName || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Email
                </p>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Téléphone
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.phone || '—'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <LogOut size={14} />
                Se déconnecter
              </button>
            </div>
          </div>
        </section>

        
        {/* Section Adresses               */}
        
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Adresses de livraison
              </h2>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
                Ajouter
              </button>
            )}
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="mb-6">
              <AddressForm
                address={editingAddress}
                onSubmit={handleSubmitAddress}
                onClose={handleCloseForm}
                isLoading={isSubmitting}
              />
            </div>
          )}

          {/* Liste des adresses */}
          {isLoadingAddresses ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-gray-200">
              <MapPin size={24} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Aucune adresse enregistrée</p>
              <p className="text-xs text-gray-400 mt-1">
                Ajoutez une adresse pour faciliter vos futures commandes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses
                .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                .map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                  />
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}