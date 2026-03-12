import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArchiveRestore } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { ProductResponse, ProductStatus } from '@/types'

import { PlusIcon } from '@/components/ui/plus'
import { SquarePenIcon } from '@/components/ui/square-pen'
import { DeleteIcon } from '@/components/ui/delete'

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  PUBLISHED: { label: 'Publié', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  DRAFT: { label: 'Brouillon', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  ARCHIVED: { label: 'Archivé', className: 'bg-gray-50 text-gray-600 ring-gray-200' },
}

export function ProductsPage() {
  const navigate = useNavigate()
  
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'ALL'>('ALL')

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await adminService.getProducts(filterStatus)
      setProducts(result)
    } catch {
      toast.error('Impossible de charger les produits')
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  // --- Handlers de Navigation ---
  function handleCreate() {
    navigate('/admin/produits/nouveau')
  }

  function handleEdit(product: ProductResponse) {
    navigate(`/admin/produits/${product.id}`)
  }

  // --- Handlers d'Actions ---
  async function handleArchive(product: ProductResponse) {
    if (!window.confirm(`Archiver le produit "${product.name}" ? Il ne sera plus visible sur le site.`)) return
    setActionLoading(product.id)
    try {
      await adminService.archiveProduct(product.id)
      toast.success(`Produit "${product.name}" archivé`)
      void fetchProducts()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(product: ProductResponse) {
    if (!window.confirm(`Supprimer définitivement le produit "${product.name}" ? Cette action est irréversible.`)) return
    setActionLoading(product.id)
    try {
      await adminService.deleteProduct(product.id)
      toast.success(`Produit "${product.name}" supprimé définitivement`)
      void fetchProducts()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const activeCount = products.filter((p) => p.status === 'PUBLISHED').length

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produits</h1>
          <p className="mt-1 text-sm text-gray-500">
            {products.length} produit{products.length > 1 ? 's' : ''} dont {activeCount} publié{activeCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <PlusIcon size={16} />
          Nouveau produit
        </button>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ProductStatus | 'ALL')}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 cursor-pointer"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PUBLISHED">Publiés</option>
          <option value="DRAFT">Brouillons</option>
          <option value="ARCHIVED">Archivés</option>
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {isLoading ? (
          <ProductsTableSkeleton />
        ) : products.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Aucun produit trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Nom
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Slug
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Mise en avant
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const config = STATUS_CONFIG[product.status] || STATUS_CONFIG.DRAFT
                
                return (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-600">
                        /{product.slug}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                          config.className
                        )}
                      >
                        {config.label}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {product.featured ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                          En avant
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {actionLoading === product.id ? (
                          <Loader2 size={16} className="animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(product)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center"
                              title="Modifier"
                            >
                              <SquarePenIcon size={15} />
                            </button>
                            
                            {/* Règle métier : on affiche le bouton archiver SEULEMENT si non archivé */}
                            {product.status !== 'ARCHIVED' ? (
                              <button
                                onClick={() => handleArchive(product)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center justify-center"
                                title="Archiver"
                              >
                                <ArchiveRestore size={15} />
                              </button>
                            ) : (
                              /* Règle métier : on affiche la poubelle de suppression SEULEMENT si archivé */
                              <button
                                onClick={() => handleDelete(product)}
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

function ProductsTableSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="ml-auto h-6 w-20" />
        </div>
      ))}
    </div>
  )
}