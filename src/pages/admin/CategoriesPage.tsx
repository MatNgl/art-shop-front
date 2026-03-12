import { useCallback, useEffect, useState } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { CategoryResponse, SubcategoryResponse } from '@/types'

import { PlusIcon } from '@/components/ui/plus'
import { SquarePenIcon } from '@/components/ui/square-pen'
import { DeleteIcon } from '@/components/ui/delete'
import { XIcon } from '@/components/ui/x'
import { CheckIcon } from '@/components/ui/check'

type EditMode = 'CATEGORY' | 'SUBCATEGORY' | null

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)

  // Formulaire
  const [editMode, setEditMode] = useState<EditMode>(null)
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryResponse | null>(null)
  const [parentCategoryIdForSub, setParentCategoryIdForSub] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await adminService.getCategories()
      const sorted = result.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      setCategories(sorted)
    } catch {
      toast.error('Impossible de charger les catégories')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  // --- Handlers Catégories ---
  function handleCreateCategory() {
    setEditMode('CATEGORY')
    setEditingCategory(null)
  }

  function handleEditCategory(category: CategoryResponse) {
    setEditMode('CATEGORY')
    setEditingCategory(category)
  }

  async function handleDeleteCategory(category: CategoryResponse) {
    if (!window.confirm(`Supprimer définitivement la catégorie "${category.name}" et toutes ses sous-catégories ?`)) return
    setActionLoading(`cat-${category.id}`)
    try {
      await adminService.deleteCategory(category.id)
      toast.success(`Catégorie "${category.name}" supprimée`)
      void fetchCategories()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  // --- Handlers Sous-catégories ---
  function handleCreateSubcategory(categoryId: string) {
    setEditMode('SUBCATEGORY')
    setEditingSubcategory(null)
    setParentCategoryIdForSub(categoryId)
    setExpandedCategoryId(categoryId) // Ouvre l'accordéon pour voir l'ajout
  }

  function handleEditSubcategory(subcategory: SubcategoryResponse) {
    setEditMode('SUBCATEGORY')
    setEditingSubcategory(subcategory)
    setParentCategoryIdForSub(subcategory.categoryId)
  }

  async function handleDeleteSubcategory(subcategory: SubcategoryResponse) {
    if (!window.confirm(`Supprimer la sous-catégorie "${subcategory.name}" ?`)) return
    setActionLoading(`sub-${subcategory.id}`)
    try {
      await adminService.deleteSubcategory(subcategory.id)
      toast.success(`Sous-catégorie "${subcategory.name}" supprimée`)
      void fetchCategories()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  // --- Soumission ---
  async function handleFormSubmit(data: { name: string; position: number }) {
    try {
      if (editMode === 'CATEGORY') {
        if (editingCategory) {
          await adminService.updateCategory(editingCategory.id, data)
          toast.success(`Catégorie mise à jour`)
        } else {
          await adminService.createCategory(data)
          toast.success(`Catégorie créée`)
        }
      } else if (editMode === 'SUBCATEGORY' && parentCategoryIdForSub) {
        if (editingSubcategory) {
          await adminService.updateSubcategory(editingSubcategory.id, data)
          toast.success(`Sous-catégorie mise à jour`)
        } else {
          await adminService.createSubcategory({ ...data, categoryId: parentCategoryIdForSub })
          toast.success(`Sous-catégorie créée`)
        }
      }
      setEditMode(null)
      void fetchCategories()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Catégories</h1>
          <p className="mt-1 text-sm text-gray-500">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''} principale{categories.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <PlusIcon size={16} />
          Nouvelle catégorie
        </button>
      </div>

      {editMode && (
        <CategoryForm
          mode={editMode}
          category={editMode === 'CATEGORY' ? editingCategory : null}
          subcategory={editMode === 'SUBCATEGORY' ? editingSubcategory : null}
          onSubmit={handleFormSubmit}
          onClose={() => setEditMode(null)}
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {isLoading ? (
          <CategoriesTableSkeleton />
        ) : categories.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Aucune catégorie créée
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="w-10 pl-4 pr-2 py-3"></th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Nom
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Slug
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Sous-catégories
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Position
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const isExpanded = expandedCategoryId === category.id
                const subcategories = category.subcategories?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) || []
                
                return (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    subcategories={subcategories}
                    isExpanded={isExpanded}
                    actionLoading={actionLoading}
                    onToggle={() => setExpandedCategoryId(isExpanded ? null : category.id)}
                    onEdit={() => handleEditCategory(category)}
                    onDelete={() => handleDeleteCategory(category)}
                    onCreateSub={() => handleCreateSubcategory(category.id)}
                    onEditSub={handleEditSubcategory}
                    onDeleteSub={handleDeleteSubcategory}
                  />
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// --- Ligne Catégorie + Sous-catégories ---

interface CategoryRowProps {
  category: CategoryResponse
  subcategories: SubcategoryResponse[]
  isExpanded: boolean
  actionLoading: string | null
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onCreateSub: () => void
  onEditSub: (sub: SubcategoryResponse) => void
  onDeleteSub: (sub: SubcategoryResponse) => void
}

function CategoryRow({
  category,
  subcategories,
  isExpanded,
  actionLoading,
  onToggle,
  onEdit,
  onDelete,
  onCreateSub,
  onEditSub,
  onDeleteSub,
}: CategoryRowProps) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={cn(
          'border-b border-gray-50 last:border-0 transition-colors cursor-pointer hover:bg-gray-50',
          isExpanded && 'bg-gray-50/80'
        )}
      >
        <td className="pl-4 pr-2 py-3 w-10 text-center">
          <button className="text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center w-full">
            <ChevronDown
              size={16}
              className={cn(
                'transition-transform duration-200',
                isExpanded ? 'rotate-180 text-gray-900' : ''
              )}
            />
          </button>
        </td>

        <td className="px-6 py-4">
          <p className="text-sm font-medium text-gray-900">{category.name}</p>
        </td>
        
        <td className="px-6 py-4">
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-600">
            /{category.slug}
          </span>
        </td>

        <td className="px-6 py-4">
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-2 ring-1 ring-inset ring-blue-200">
            {subcategories.length}
          </span>
        </td>

        <td className="px-6 py-4">
          <span className="text-sm text-gray-500">{category.position ?? 0}</span>
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {actionLoading === `cat-${category.id}` ? (
              <Loader2 size={16} className="animate-spin text-gray-400" />
            ) : (
              <>
                <button
                  onClick={onEdit}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center"
                  title="Modifier"
                >
                  <SquarePenIcon size={15} />
                </button>
                <button
                  onClick={onDelete}
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

      {/* Déploiement des sous-catégories */}
      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50/80 px-12 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sous-catégories
              </span>
              <button
                onClick={onCreateSub}
                className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <PlusIcon size={14} />
                Ajouter
              </button>
            </div>

            {subcategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
                Aucune sous-catégorie
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {subcategories.map((sub) => (
                      <tr key={sub.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3 w-1/3">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 w-1/3">
                          <span className="rounded bg-gray-50 px-2 py-0.5 text-xs font-mono text-gray-500">
                            /{sub.slug}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 w-24 text-center">
                          Pos: {sub.position ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {actionLoading === `sub-${sub.id}` ? (
                              <Loader2 size={14} className="animate-spin text-gray-400" />
                            ) : (
                              <>
                                <button
                                  onClick={() => onEditSub(sub)}
                                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center"
                                  title="Modifier"
                                >
                                  <SquarePenIcon size={14} />
                                </button>
                                <button
                                  onClick={() => onDeleteSub(sub)}
                                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
                                  title="Supprimer"
                                >
                                  <DeleteIcon size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// --- Formulaire ---

interface CategoryFormProps {
  mode: EditMode
  category: CategoryResponse | null
  subcategory: SubcategoryResponse | null
  onSubmit: (data: { name: string; position: number }) => Promise<void>
  onClose: () => void
}

function CategoryForm({ mode, category, subcategory, onSubmit, onClose }: CategoryFormProps) {
  const isEditing = !!category || !!subcategory
  const defaultName = category?.name ?? subcategory?.name ?? ''
  const defaultPos = category?.position ?? subcategory?.position ?? 0

  const [name, setName] = useState(defaultName)
  const [position, setPosition] = useState(defaultPos.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const title = mode === 'CATEGORY' 
    ? (isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie')
    : (isEditing ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom est obligatoire')
      return
    }
    const posNum = parseInt(position, 10)
    if (isNaN(posNum)) {
      toast.error('La position doit être un nombre')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), position: posNum })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center"
        >
          <XIcon size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Peintures"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
              autoFocus
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            />
          </div>
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
            {isEditing ? 'Enregistrer' : 'Créer'}
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

function CategoriesTableSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-24 rounded-lg" />
          <Skeleton className="h-6 w-8 rounded-full" />
          <Skeleton className="ml-auto h-6 w-16" />
        </div>
      ))}
    </div>
  )
}