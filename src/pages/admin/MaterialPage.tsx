import { useCallback, useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { MaterialResponse } from '@/types'

export function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<MaterialResponse | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await adminService.getMaterials()
      setMaterials(result)
    } catch {
      toast.error('Impossible de charger les matériaux')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchMaterials()
  }, [fetchMaterials])

  function handleEdit(material: MaterialResponse) {
    setEditingMaterial(material)
    setShowForm(true)
  }

  function handleCreate() {
    setEditingMaterial(null)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingMaterial(null)
  }

  async function handleFormSubmit(data: { name: string; description?: string; isActive: boolean }) {
    try {
      if (editingMaterial) {
        await adminService.updateMaterial(editingMaterial.id, data)
        toast.success(`"${data.name}" mis à jour`)
      } else {
        await adminService.createMaterial(data)
        toast.success(`"${data.name}" créé`)
      }
      handleFormClose()
      void fetchMaterials()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    }
  }

  async function handleToggleActive(material: MaterialResponse) {
    setActionLoading(material.id)
    try {
      await adminService.updateMaterial(material.id, { isActive: !material.isActive })
      toast.success(
        material.isActive
          ? `"${material.name}" désactivé`
          : `"${material.name}" activé`,
      )
      void fetchMaterials()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(material: MaterialResponse) {
    if (!window.confirm(`Supprimer définitivement "${material.name}" ?`)) return

    setActionLoading(material.id)
    try {
      await adminService.deleteMaterial(material.id)
      toast.success(`"${material.name}" supprimé`)
      void fetchMaterials()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const activeCount = materials.filter((m) => m.isActive).length

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Matériaux</h1>
          <p className="mt-1 text-sm text-gray-500">
            {materials.length} matériau{materials.length > 1 ? 'x' : ''} dont {activeCount} actif{activeCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Nouveau matériau
        </button>
      </div>

      {showForm && (
        <MaterialForm
          material={editingMaterial}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <MaterialsTableSkeleton />
        ) : materials.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Aucun matériau créé
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Nom
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Description
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Créé le
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr
                  key={material.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{material.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {material.description || '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(material)}
                      disabled={actionLoading === material.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset cursor-pointer transition-colors',
                        material.isActive
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-50 text-gray-500 ring-gray-200 hover:bg-gray-100',
                      )}
                    >
                      {actionLoading === material.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <span className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          material.isActive ? 'bg-emerald-500' : 'bg-gray-400',
                        )} />
                      )}
                      {material.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(material.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {actionLoading === material.id ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(material)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(material)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

interface MaterialFormProps {
  material: MaterialResponse | null
  onSubmit: (data: { name: string; description?: string; isActive: boolean }) => Promise<void>
  onClose: () => void
}

function MaterialForm({ material, onSubmit, onClose }: MaterialFormProps) {
  const [name, setName] = useState(material?.name ?? '')
  const [description, setDescription] = useState(material?.description ?? '')
  const [isActive, setIsActive] = useState(material?.isActive ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom est obligatoire')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        isActive,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          {material ? 'Modifier le matériau' : 'Nouveau matériau'}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Papier Fine Art"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
            <span className="ml-1 text-gray-300 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Papier haut de gamme pour impressions artistiques"
            rows={2}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
          />
          <span className="text-sm text-gray-600">Actif</span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {material ? 'Enregistrer' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

function MaterialsTableSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="ml-auto h-6 w-16" />
        </div>
      ))}
    </div>
  )
}