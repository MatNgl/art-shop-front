import { useCallback, useEffect, useState } from 'react'
// On garde Loader2 de lucide car c'est généralement juste une animation CSS (spin) 
// à moins que tu aies aussi créé un Loader animé spécifique !
import { Loader2 } from 'lucide-react' 
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { FormatResponse } from '@/types'

import { PlusIcon } from '@/components/ui/plus'
import { SquarePenIcon } from '@/components/ui/square-pen'
import { DeleteIcon } from '@/components/ui/delete'
import { XIcon } from '@/components/ui/x'
import { CheckIcon } from '@/components/ui/check'

export function FormatsPage() {
  const [formats, setFormats] = useState<FormatResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFormat, setEditingFormat] = useState<FormatResponse | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchFormats = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await adminService.getFormats()
      setFormats(result)
    } catch {
      toast.error('Impossible de charger les formats')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchFormats()
  }, [fetchFormats])

  function handleEdit(format: FormatResponse) {
    setEditingFormat(format)
    setShowForm(true)
  }

  function handleCreate() {
    setEditingFormat(null)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingFormat(null)
  }

  async function handleFormSubmit(data: {
    name: string
    widthMm: number
    heightMm: number
    isCustom: boolean
  }) {
    try {
      if (editingFormat) {
        await adminService.updateFormat(editingFormat.id, data)
        toast.success(`"${data.name}" mis à jour`)
      } else {
        await adminService.createFormat(data)
        toast.success(`"${data.name}" créé`)
      }
      handleFormClose()
      void fetchFormats()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    }
  }

  async function handleDelete(format: FormatResponse) {
    if (!window.confirm(`Supprimer définitivement "${format.name}" ?`)) return

    setActionLoading(format.id)
    try {
      await adminService.deleteFormat(format.id)
      toast.success(`"${format.name}" supprimé`)
      void fetchFormats()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const standardCount = formats.filter((f) => !f.isCustom).length
  const customCount = formats.filter((f) => f.isCustom).length

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Formats</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formats.length} format{formats.length > 1 ? 's' : ''} — {standardCount} standard{standardCount > 1 ? 's' : ''}, {customCount} personnalisé{customCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <PlusIcon size={16} />
          Nouveau format
        </button>
      </div>

      {showForm && (
        <FormatForm
          format={editingFormat}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <FormatsTableSkeleton />
        ) : formats.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Aucun format créé
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Nom
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Dimensions
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Type
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
              {formats.map((format) => (
                <tr
                  key={format.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{format.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-600">
                      {format.widthMm} × {format.heightMm} mm
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                        format.isCustom
                          ? 'bg-amber-50 text-amber-700 ring-amber-200'
                          : 'bg-blue-50 text-blue-700 ring-blue-200',
                      )}
                    >
                      {format.isCustom ? 'Personnalisé' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(format.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {actionLoading === format.id ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(format)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center"
                            title="Modifier"
                          >
                            <SquarePenIcon size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(format)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
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
    </div>
  )
}

interface FormatFormProps {
  format: FormatResponse | null
  onSubmit: (data: { name: string; widthMm: number; heightMm: number; isCustom: boolean }) => Promise<void>
  onClose: () => void
}

function FormatForm({ format, onSubmit, onClose }: FormatFormProps) {
  const [name, setName] = useState(format?.name ?? '')
  const [widthMm, setWidthMm] = useState(format?.widthMm?.toString() ?? '')
  const [heightMm, setHeightMm] = useState(format?.heightMm?.toString() ?? '')
  const [isCustom, setIsCustom] = useState(format?.isCustom ?? false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Le nom est obligatoire')
      return
    }

    const w = parseInt(widthMm, 10)
    const h = parseInt(heightMm, 10)

    if (isNaN(w) || w <= 0) {
      toast.error('La largeur doit être un nombre positif')
      return
    }
    if (isNaN(h) || h <= 0) {
      toast.error('La hauteur doit être un nombre positif')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), widthMm: w, heightMm: h, isCustom })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          {format ? 'Modifier le format' : 'Nouveau format'}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center"
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
            placeholder="Ex : A4"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Largeur
              <span className="ml-1 text-gray-300 font-normal">(mm)</span>
            </label>
            <input
              type="number"
              value={widthMm}
              onChange={(e) => setWidthMm(e.target.value)}
              placeholder="210"
              min={1}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hauteur
              <span className="ml-1 text-gray-300 font-normal">(mm)</span>
            </label>
            <input
              type="number"
              value={heightMm}
              onChange={(e) => setHeightMm(e.target.value)}
              placeholder="297"
              min={1}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isCustom}
            onChange={(e) => setIsCustom(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
          />
          <span className="text-sm text-gray-600">Format personnalisé</span>
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
              <CheckIcon size={16} />
            )}
            {format ? 'Enregistrer' : 'Créer'}
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

function FormatsTableSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="ml-auto h-6 w-16" />
        </div>
      ))}
    </div>
  )
}