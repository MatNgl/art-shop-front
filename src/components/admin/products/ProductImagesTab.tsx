import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, ImagePlus, Star, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import * as adminService from '@/services/admin.service'
import type { ProductResponse, ProductImageResponse } from '@/types'
import { DeleteIcon } from '@/components/ui/delete'
import { CheckIcon } from '@/components/ui/check'
import { XIcon } from '@/components/ui/x'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useConfirm } from '@/hooks/useConfirm'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function ProductImagesTab({ product }: { product: ProductResponse }) {
  const [images, setImages] = useState<ProductImageResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const { modalProps, confirm } = useConfirm()

  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await adminService.getProductImages(product.id)
      setImages(result)
    } catch {
      toast.error('Impossible de charger les images')
    } finally {
      setIsLoading(false)
    }
  }, [product.id])

  useEffect(() => {
    void fetchImages()
  }, [fetchImages])

  // --- Upload ---

  function validateFile(file: File): boolean {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`Type non supporté : ${file.type}. Acceptés : JPEG, PNG, WebP, GIF`)
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Fichier trop volumineux : ${(file.size / 1024 / 1024).toFixed(1)} Mo. Max : 10 Mo`)
      return false
    }
    return true
  }

  async function handleUpload(files: FileList | File[]) {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(validateFile)

    if (validFiles.length === 0) return

    setUploadLoading(true)
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const isPrimary = images.length === 0 && i === 0
        await adminService.uploadProductImage(product.id, file, {
          position: images.length + i,
          isPrimary,
        })
      }
      toast.success(
        validFiles.length === 1
          ? 'Image uploadée'
          : `${validFiles.length} images uploadées`,
      )
      void fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'upload")
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      void handleUpload(e.target.files)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      void handleUpload(e.dataTransfer.files)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
  }

  // --- Actions ---

  async function handleSetPrimary(image: ProductImageResponse) {
    if (image.isPrimary) return
    setActionLoading(`primary-${image.id}`)
    try {
      await adminService.setProductImagePrimary(product.id, image.id)
      toast.success('Image principale définie')
      void fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(image: ProductImageResponse) {
    const confirmed = await confirm({
      title: 'Supprimer cette image ?',
      description: "Cette action est irréversible. L'image sera supprimée de Cloudinary.",
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })
    if (!confirmed) return

    setActionLoading(`delete-${image.id}`)
    try {
      await adminService.deleteProductImage(product.id, image.id)
      toast.success('Image supprimée')
      void fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleAltTextSave(image: ProductImageResponse, newAltText: string) {
    try {
      await adminService.updateProductImage(product.id, image.id, {
        altText: newAltText.trim() || undefined,
      })
      toast.success('Texte alternatif mis à jour')
      setEditingImageId(null)
      void fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  if (isLoading) return <ImagesSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Images ({images.length})
        </h2>
      </div>

      {/* Zone d'upload / Drag & Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors cursor-pointer',
          isDragOver
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
        )}
      >
        {uploadLoading ? (
          <Loader2 size={32} className="animate-spin text-gray-400" />
        ) : (
          <>
            <div className="rounded-xl bg-gray-100 p-3">
              <Upload size={24} className="text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Glissez vos images ici
              </p>
              <p className="mt-1 text-xs text-gray-400">
                ou cliquez pour parcourir — JPEG, PNG, WebP, GIF — 10 Mo max
              </p>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Grille d'images */}
      {images.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <ImagePlus size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">Aucune image pour ce produit</p>
          <p className="mt-1 text-xs text-gray-400">
            Uploadez votre première image ci-dessus
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isEditing={editingImageId === image.id}
              actionLoading={actionLoading}
              onSetPrimary={() => handleSetPrimary(image)}
              onDelete={() => handleDelete(image)}
              onEditAltText={() => setEditingImageId(image.id)}
              onCancelEdit={() => setEditingImageId(null)}
              onSaveAltText={(text) => handleAltTextSave(image, text)}
            />
          ))}
        </div>
      )}
            <ConfirmModal {...modalProps} />

    </div>
  )
}

// --- Carte image ---

interface ImageCardProps {
  image: ProductImageResponse
  isEditing: boolean
  actionLoading: string | null
  onSetPrimary: () => void
  onDelete: () => void
  onEditAltText: () => void
  onCancelEdit: () => void
  onSaveAltText: (text: string) => void
}

function ImageCard({
  image,
  isEditing,
  actionLoading,
  onSetPrimary,
  onDelete,
  onEditAltText,
  onCancelEdit,
  onSaveAltText,
}: ImageCardProps) {
  const [altText, setAltText] = useState(image.altText ?? '')
  const isActionLoading =
    actionLoading === `primary-${image.id}` || actionLoading === `delete-${image.id}`

  function handleStartEdit() {
    setAltText(image.altText ?? '')
    onEditAltText()
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        <img
          src={image.urls.medium}
          alt={image.altText ?? ''}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {/* Badge principal */}
        {image.isPrimary && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-gray-900/80 px-2 py-1 backdrop-blur-sm">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
              Principale
            </span>
          </div>
        )}

        {/* Overlay actions (au survol) */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 group-hover:bg-black/40 group-hover:opacity-100 transition-all duration-200">
          {isActionLoading ? (
            <Loader2 size={20} className="animate-spin text-white" />
          ) : (
            <>
              {!image.isPrimary && (
                <button
                  onClick={onSetPrimary}
                  className="rounded-xl bg-white/90 p-2.5 text-gray-700 hover:bg-white hover:text-amber-600 transition-colors cursor-pointer"
                  title="Définir comme principale"
                >
                  <Star size={16} />
                </button>
              )}
              <button
                onClick={onDelete}
                className="rounded-xl bg-white/90 p-2.5 text-gray-700 hover:bg-white hover:text-red-500 transition-colors cursor-pointer"
                title="Supprimer"
              >
                <DeleteIcon size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Zone info / Alt text */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Texte alternatif..."
              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSaveAltText(altText)
                }
                if (e.key === 'Escape') onCancelEdit()
              }}
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSaveAltText(altText)}
                className="rounded-lg bg-gray-900 p-1.5 text-white hover:bg-gray-800 transition-colors cursor-pointer"
                title="Enregistrer"
              >
                <CheckIcon size={12} />
              </button>
              <button
                onClick={onCancelEdit}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                title="Annuler"
              >
                <XIcon size={12} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="w-full text-left cursor-pointer group/alt"
          >
            <p className="text-xs text-gray-500 truncate group-hover/alt:text-gray-900 transition-colors">
              {image.altText || 'Ajouter un texte alternatif...'}
            </p>
          </button>
        )}
      </div>
    </div>
  )
}

function ImagesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}