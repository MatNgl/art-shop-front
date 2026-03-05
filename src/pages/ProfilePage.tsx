import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  MapPin,
  Plus,
  LogOut,
  Package,
  ChevronRight,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AddressCard, AddressForm } from '@/components/profile'
import { OrderStatusBadge } from '@/components/orders'
import * as addressesService from '@/services/addresses.service'
import * as ordersService from '@/services/orders.service'
import type { Address, AddressPayload, OrderSummary } from '@/types'
import type { AddressFormData } from '@/schemas'

/** Formate une date ISO en format court français */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const navigate = useNavigate()

  // Adresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Commandes
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)

  // ── Chargement des données ──

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

  const loadOrders = useCallback(async () => {
    try {
      const data = await ordersService.getMyOrders()
      setOrders(data)
    } catch {
      // Silencieux — liste vide
    } finally {
      setIsLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      void loadAddresses()
      void loadOrders()
    }
  }, [isAuthenticated, loadAddresses, loadOrders])

  // ── Handlers adresses ──

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

  // ── Loading auth ──

  if (authLoading) {
    return (
      <main className="min-h-screen pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto animate-pulse space-y-10">
          <div>
            <Skeleton className="h-6 w-32 mb-6" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  // ── Non connecté ──

  if (!isAuthenticated || !user || user.role.code === 'GUEST') {
    return (
      <main className="min-h-screen pt-28 pb-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
            <User size={36} className="text-gray-300" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            Rejoignez-nous
          </h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Créez un compte pour suivre vos commandes, enregistrer vos adresses
            de livraison et profiter d'une expérience personnalisée.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/register')}
            >
              <UserPlus size={18} />
              Créer un compte
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Se connecter
            </Button>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Vous pouvez aussi explorer la{' '}
            <Link
              to="/galerie"
              className="text-gray-600 underline underline-offset-2 hover:text-gray-900 transition-colors"
            >
              galerie
            </Link>{' '}
            sans créer de compte.
          </p>
        </div>
      </main>
    )
  }

  // ── Connecté ──

  // 3 dernières commandes pour l'aperçu
  const recentOrders = orders.slice(0, 3)

  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* ── Section Profil ── */}
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
                  {user.firstName || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Nom
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user.lastName || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Email
                </p>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Téléphone
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user.phone || '—'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => void handleLogout()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                Se déconnecter
              </button>
            </div>
          </div>
        </section>

        {/* ── Section Commandes ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Mes commandes
              </h2>
            </div>

            {orders.length > 3 && (
              <Link
                to="/commandes"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Tout voir
                <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {isLoadingOrders ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 p-5 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-gray-200">
              <Package size={24} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Aucune commande pour le moment
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Vos commandes apparaîtront ici après votre premier achat.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/commandes/${order.id}`}
                  className="group flex items-center justify-between rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="text-gray-300">·</span>
                      <span>
                        {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {order.total.toFixed(2)} €
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
                    />
                  </div>
                </Link>
              ))}

              {orders.length > 3 && (
                <div className="text-center pt-2">
                  <Link
                    to="/commandes"
                    className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors"
                  >
                    Voir les {orders.length} commandes
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Section Adresses ── */}
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
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-full hover:bg-gray-50 cursor-pointer transition-colors"
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
            <div className="text-center py-10 rounded-xl border border-dashed border-gray-200">
              <MapPin size={24} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Aucune adresse enregistrée</p>
              <p className="text-xs text-gray-400 mt-1">
                Ajoutez une adresse pour faciliter vos futures commandes.
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