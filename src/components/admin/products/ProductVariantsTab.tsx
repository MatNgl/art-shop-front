import { useCallback, useEffect, useState } from 'react'
import { Loader2, ArchiveRestore, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import * as adminService from '@/services/admin.service'
import type { 
  ProductResponse, 
  ProductVariantResponse, 
  ProductVariantPayload, 
  ProductVariantStatus,
  FormatResponse,
  MaterialResponse
} from '@/types'

import { PlusIcon } from '@/components/ui/plus'
import { SquarePenIcon } from '@/components/ui/square-pen'
import { DeleteIcon } from '@/components/ui/delete'
import { XIcon } from '@/components/ui/x'
import { CheckIcon } from '@/components/ui/check'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_CONFIG: Record<ProductVariantStatus, { label: string; className: string }> = {
  AVAILABLE: { label: 'Disponible', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  OUT_OF_STOCK: { label: 'Rupture', className: 'bg-red-50 text-red-700 ring-red-200' },
  DISCONTINUED: { label: 'Arrêté (Archivé)', className: 'bg-gray-50 text-gray-600 ring-gray-200' },
}

export function ProductVariantsTab({ product }: { product: ProductResponse }) {
  const [variants, setVariants] = useState<ProductVariantResponse[]>([])
  const [formats, setFormats] = useState<FormatResponse[]>([])
  const [materials, setMaterials] = useState<MaterialResponse[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [showForm, setShowForm] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariantResponse | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // On charge tout en parallèle
      const [variantsData, formatsData, materialsData] = await Promise.all([
        adminService.getProductVariants(product.id),
        adminService.getFormats(),
        adminService.getMaterials()
      ])
      setVariants(variantsData)
      setFormats(formatsData.filter(f => !f.isCustom)) // Exemple: on filtre les standards ? (optionnel)
      setMaterials(materialsData.filter(m => m.isActive))
    } catch {
      toast.error('Impossible de charger les données des variantes')
    } finally {
      setIsLoading(false)
    }
  }, [product.id])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // --- Handlers ---
  function handleCreate() {
    setEditingVariant(null)
    setShowForm(true)
  }

  function handleEdit(variant: ProductVariantResponse) {
    setEditingVariant(variant)
    setShowForm(true)
  }

  async function handleArchive(variant: ProductVariantResponse) {
    if (!window.confirm('Archiver cette variante ? Elle ne sera plus vendable.')) return
    setActionLoading(variant.id)
    try {
      await adminService.archiveProductVariant(product.id, variant.id)
      toast.success('Variante archivée')
      void fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(variant: ProductVariantResponse) {
    if (!window.confirm('Supprimer définitivement cette variante ?')) return
    setActionLoading(variant.id)
    try {
      await adminService.deleteProductVariant(product.id, variant.id)
      toast.success('Variante supprimée')
      void fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleStockAdjust(variant: ProductVariantResponse) {
    const input = window.prompt(`Ajuster le stock pour ${variant.format.name} - ${variant.material.name}\n(Utilisez "-" pour retirer, ex: -5 ou 10)`)
    if (!input) return
    const change = parseInt(input, 10)
    if (isNaN(change)) {
      toast.error('Veuillez entrer un nombre valide')
      return
    }

    setActionLoading(`stock-${variant.id}`)
    try {
      await adminService.updateVariantStock(product.id, variant.id, change)
      toast.success('Stock mis à jour avec succès')
      void fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de stock')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleFormSubmit(data: ProductVariantPayload) {
    try {
      if (editingVariant) {
        await adminService.updateProductVariant(product.id, editingVariant.id, data)
        toast.success('Variante mise à jour')
      } else {
        await adminService.createProductVariant(product.id, data)
        toast.success('Variante créée')
      }
      setShowForm(false)
      void fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur (Vérifiez les doublons)')
    }
  }

  if (isLoading) return <VariantsSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Variantes ({variants.length})</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <PlusIcon size={16} />
          Ajouter une variante
        </button>
      </div>

      {showForm && (
        <VariantForm 
          variant={editingVariant} 
          formats={formats} 
          materials={materials} 
          onSubmit={handleFormSubmit} 
          onClose={() => setShowForm(false)} 
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {variants.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Aucune variante configurée pour ce produit.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Format</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Matériau</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Prix</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Stock</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Statut</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => {
                const config = STATUS_CONFIG[variant.status]
                
                return (
                  <tr key={variant.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{variant.format.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{variant.material.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{Number(variant.price).toFixed(2)} €</td>                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-sm font-mono px-2.5 py-1 rounded-lg",
                        variant.stockQty <= 0 ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
                      )}>
                        {variant.stockQty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset', config.className)}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {actionLoading === `stock-${variant.id}` || actionLoading === variant.id ? (
                          <Loader2 size={16} className="animate-spin text-gray-400" />
                        ) : (
                          <>
                            {variant.status !== 'DISCONTINUED' && (
                              <button
                                onClick={() => handleStockAdjust(variant)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center"
                                title="Ajuster le stock"
                              >
                                <PackagePlus size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(variant)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center"
                              title="Modifier"
                            >
                              <SquarePenIcon size={15} />
                            </button>
                            
                            {variant.status !== 'DISCONTINUED' ? (
                              <button
                                onClick={() => handleArchive(variant)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center justify-center"
                                title="Arrêter la vente (Archiver)"
                              >
                                <ArchiveRestore size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDelete(variant)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
                                title="Supprimer définitivement"
                              >
                                <DeleteIcon size={15} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// --- Sous-composant Formulaire ---

interface VariantFormProps {
  variant: ProductVariantResponse | null
  formats: FormatResponse[]
  materials: MaterialResponse[]
  onSubmit: (data: ProductVariantPayload) => Promise<void>
  onClose: () => void
}

function VariantForm({ variant, formats, materials, onSubmit, onClose }: VariantFormProps) {
  const isEditing = !!variant
  
  const [formatId, setFormatId] = useState(variant?.format.id ?? '')
  const [materialId, setMaterialId] = useState(variant?.material.id ?? '')
  const [price, setPrice] = useState(variant?.price.toString() ?? '')
  // Le stock est optionnel, on le gère surtout à la création
  const [stockQty, setStockQty] = useState(variant?.stockQty.toString() ?? '0')
  const [status, setStatus] = useState<ProductVariantStatus>(variant?.status ?? 'AVAILABLE')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formatId || !materialId) {
      toast.error('Veuillez sélectionner un format et un matériau')
      return
    }
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Le prix doit être un nombre positif')
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        formatId,
        materialId,
        price: parsedPrice,
        stockQty: parseInt(stockQty, 10) || 0,
        status,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          {isEditing ? 'Modifier la déclinaison' : 'Nouvelle déclinaison'}
        </h3>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
          <XIcon size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Format *</label>
            <select
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
              required
            >
              <option value="" disabled>Sélectionnez un format</option>
              {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Matériau *</label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
              required
            >
              <option value="" disabled>Sélectionnez un matériau</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix (€) *</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-mono text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Initial</label>
            <input
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              disabled={isEditing} // Généralement, en édition, on utilise le bouton d'ajustement de stock
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-mono text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            />
            {isEditing && <p className="mt-1 text-[10px] text-gray-400">Utilisez l'icône + dans la liste pour ajuster</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductVariantStatus)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="OUT_OF_STOCK">Rupture</option>
              <option value="DISCONTINUED">Archivé</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckIcon size={16} />}
            {isEditing ? 'Enregistrer' : 'Créer'}
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-900">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

function VariantsSkeleton() {
  return (
    <div className="space-y-4 py-4">
      <Skeleton className="h-8 w-48 mb-6" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}