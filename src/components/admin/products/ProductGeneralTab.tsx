import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import * as adminService from '@/services/admin.service'
import type { ProductResponse, ProductPayload, ProductStatus, TagResponse, CategoryResponse } from '@/types'
import { CheckIcon } from '@/components/ui/check'

interface ProductGeneralTabProps {
  product: ProductResponse | null
  onSaved: (product: ProductResponse) => void
}

export function ProductGeneralTab({ product, onSaved }: ProductGeneralTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTags, setAvailableTags] = useState<TagResponse[]>([])
  const [availableCategories, setAvailableCategories] = useState<CategoryResponse[]>([])

  const [name, setName] = useState(product?.name ?? '')
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'DRAFT')
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? '')
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? '')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    product?.tags?.map(t => t.id) ?? []
  )
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories?.map(c => c.id) ?? []
  )

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [tags, categories] = await Promise.all([
          adminService.getTags(),
          adminService.getCategories(),
        ])
        setAvailableTags(tags)
        setAvailableCategories(categories)
      } catch {
        toast.error('Impossible de charger les données de référence')
      }
    }
    void loadReferenceData()
  }, [])

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom du produit est obligatoire')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: ProductPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        status,
        featured,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      }

      let savedProduct: ProductResponse
      if (product) {
        savedProduct = await adminService.updateProduct(product.id, payload)
        toast.success('Produit mis à jour')
      } else {
        savedProduct = await adminService.createProduct(payload)
        toast.success('Produit créé avec succès')
      }
      onSaved(savedProduct)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLONNE GAUCHE */}
        <div className="col-span-2 space-y-6">
          <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Informations de base
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'œuvre *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Coucher de soleil sur Tokyo"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description courte</label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Phrase d'accroche (affichée dans les listes)..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description complète</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Racontez l'histoire de l'œuvre..."
                rows={6}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Référencement (SEO)
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre SEO</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={name || "Titre pour Google..."}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={shortDescription || "Description pour Google..."}
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Visibilité
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors cursor-pointer"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
              />
              <span className="text-sm font-medium text-gray-700">Mettre en avant sur l'accueil</span>
            </label>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Catégories
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableCategories.length === 0 ? (
                <span className="text-sm text-gray-400">Aucune catégorie disponible</span>
              ) : (
                availableCategories.map(cat => {
                  const isSelected = selectedCategoryIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border cursor-pointer",
                        isSelected
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      )}
                    >
                      {cat.name}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableTags.length === 0 ? (
                <span className="text-sm text-gray-400">Aucun tag disponible</span>
              ) : (
                availableTags.map(tag => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border cursor-pointer",
                        isSelected
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      )}
                    >
                      {tag.name}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckIcon size={16} />}
          {product ? 'Mettre à jour le produit' : 'Créer le produit'}
        </button>
      </div>
    </form>
  )
}