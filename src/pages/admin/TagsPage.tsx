import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { TagResponse } from '@/types'

import { PlusIcon } from '@/components/ui/plus'
import { SquarePenIcon } from '@/components/ui/square-pen'
import { DeleteIcon } from '@/components/ui/delete'
import { XIcon } from '@/components/ui/x'
import { CheckIcon } from '@/components/ui/check'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useConfirm } from '@/hooks'

export function TagsPage() {
  const [tags, setTags] = useState<TagResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { modalProps, confirm } = useConfirm()

  const fetchTags = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await adminService.getTags()
      setTags(result)
    } catch {
      toast.error('Impossible de charger les tags')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTags()
  }, [fetchTags])

  function handleEdit(tag: TagResponse) {
    setEditingTag(tag)
    setShowForm(true)
  }

  function handleCreate() {
    setEditingTag(null)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingTag(null)
  }

  async function handleFormSubmit(data: { name: string }) {
    try {
      if (editingTag) {
        await adminService.updateTag(editingTag.id, data)
        toast.success(`"${data.name}" mis à jour`)
      } else {
        await adminService.createTag(data)
        toast.success(`"${data.name}" créé`)
      }
      handleFormClose()
      void fetchTags()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    }
  }

  async function handleDelete(tag: TagResponse) {
    const confirmed = await confirm({
      title: `Supprimer le tag "${tag.name}" ?`,
      description: 'Ce tag sera retiré de tous les produits associés.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })
    if (!confirmed) return

    setActionLoading(tag.id)
    try {
      await adminService.deleteTag(tag.id)
      toast.success(`"${tag.name}" supprimé`)
      void fetchTags()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tags</h1>
          <p className="mt-1 text-sm text-gray-500">
            {tags.length} tag{tags.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <PlusIcon size={16} />
          Nouveau tag
        </button>
      </div>

      {showForm && (
        <TagForm
          tag={editingTag}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {isLoading ? (
          <TagsTableSkeleton />
        ) : tags.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Aucun tag créé
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
                  Créé le
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr
                  key={tag.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{tag.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-600">
                      {tag.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(tag.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {actionLoading === tag.id ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(tag)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center cursor-pointer"
                            title="Modifier"
                          >
                            <SquarePenIcon size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(tag)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer"
                            title="Supprimer"
                          >
                            <DeleteIcon size={15} />
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

      <ConfirmModal {...modalProps} />
    </div>
  )
}

// --- Formulaire ---

interface TagFormProps {
  tag: TagResponse | null
  onSubmit: (data: { name: string }) => Promise<void>
  onClose: () => void
}

function TagForm({ tag, onSubmit, onClose }: TagFormProps) {
  const [name, setName] = useState(tag?.name ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom est obligatoire')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim() })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          {tag ? 'Modifier le tag' : 'Nouveau tag'}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center cursor-pointer"
        >
          <XIcon size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Japon"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            autoFocus
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Le slug sera généré automatiquement à partir du nom
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckIcon size={16} />
            )}
            {tag ? 'Enregistrer' : 'Créer'}
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

function TagsTableSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-lg" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="ml-auto h-6 w-16" />
        </div>
      ))}
    </div>
  )
}