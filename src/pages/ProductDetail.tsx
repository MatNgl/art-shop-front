// src/pages/ProductDetail.tsx

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { VariantSelector } from '@/components/catalog/VariantSelector'
import { QuantitySelector } from '@/components/catalog/QuantitySelector'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { useProductDetailBreadcrumb } from '@/hooks/useBreadcrumb'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'
import {
  getProductBySlug,
  getProductVariants,
  getProductImages,
  getPublishedProducts,
} from '@/services/products.service'
import type { Product, ProductVariant, ProductImage } from '@/types'

// ── Skeleton ─────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-12 lg:px-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-4/5 w-full rounded-2xl bg-gray-100" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-16 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="space-y-6 pt-4">
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-8 w-3/4 rounded bg-gray-100" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-5/6 rounded bg-gray-100" />
            <div className="h-3 w-4/6 rounded bg-gray-100" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-24 rounded-lg bg-gray-100" />
            ))}
          </div>
          <div className="h-14 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Produits similaires
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [relatedImages, setRelatedImages] = useState<Record<string, ProductImage>>({})

  const breadcrumbItems = useProductDetailBreadcrumb({ product })

  useEffect(() => {
    if (!slug) return

    async function load(): Promise<void> {
      try {
        const fetchedProduct = await getProductBySlug(slug!)

        const [fetchedVariants, fetchedImages] = await Promise.all([
          getProductVariants(fetchedProduct.id).catch(() => []),
          getProductImages(fetchedProduct.id).catch(() => []),
        ])

        const sortedImages = [...fetchedImages].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1
          if (!a.isPrimary && b.isPrimary) return 1
          return a.position - b.position
        })

        setProduct(fetchedProduct)
        setVariants(fetchedVariants)
        setImages(sortedImages)
        setActiveImageIndex(0)

        const firstAvailable = fetchedVariants.find((v) => v.status === 'AVAILABLE')
        if (firstAvailable) setSelectedVariant(firstAvailable)

        void loadRelatedProducts(fetchedProduct.id)
      } catch {
        setNotFound(true)
        toast.error('Œuvre introuvable', {
          id: 'product-not-found',
          description: 'Cette œuvre n\'existe pas ou a été retirée.',
        })
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  async function loadRelatedProducts(currentProductId: string): Promise<void> {
    try {
      const all = await getPublishedProducts()
      const others = all.filter((p) => p.id !== currentProductId).slice(0, 4)
      setRelatedProducts(others)

      const results = await Promise.allSettled(
        others.map((p) =>
          getProductImages(p.id).then((imgs) => ({
            productId: p.id,
            primary: imgs.find((i) => i.isPrimary) ?? imgs[0] ?? null,
          })),
        ),
      )

      const map: Record<string, ProductImage> = {}
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value.primary) {
          map[r.value.productId] = r.value.primary
        }
      })
      setRelatedImages(map)
    } catch {
      toast.error('Suggestions indisponibles', {
        id: 'related-products-error',
        description: 'Les œuvres similaires sont indisponibles.',
      })
    }
  }

  async function handleAddToCart(variant: ProductVariant, quantity: number): Promise<void> {
    await addItem({
      productVariantId: variant.id,
      quantity,
    })
  }

  function prevImage(): void {
    setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  function nextImage(): void {
    setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  if (loading) return <ProductDetailSkeleton />

  if (notFound || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-gray-400">Œuvre introuvable.</p>
        <button
          onClick={() => navigate('/galerie')}
          className="text-sm text-gray-500 underline"
        >
          Retour à la galerie
        </button>
      </div>
    )
  }

  const activeImage = images[activeImageIndex] ?? null

  return (
    <main className="min-h-screen bg-white">
      {/* ── Bouton retour ── */}
      <div className="mx-auto max-w-5xl px-6 pt-8 lg:px-12">
        <button
          onClick={() => navigate('/galerie')}
          className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Retour à la galerie
        </button>
      </div>

      {/* ── Contenu principal ── */}
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-12">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* ── Colonne image ── */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-gray-50">
              <div className="aspect-4/5">
                <AnimatePresence mode="wait">
                  {activeImage ? (
                    <motion.img
                      key={activeImage.id}
                      src={activeImage.urls.large ?? activeImage.url}
                      alt={activeImage.altText ?? product.name}
                      className="h-full w-full object-contain p-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-sm text-gray-300">Aucune image</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur-sm transition hover:bg-white"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur-sm transition hover:bg-white"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      i === activeImageIndex
                        ? 'border-gray-900 opacity-100'
                        : 'border-transparent opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img
                      src={img.urls.thumbnail ?? img.url}
                      alt={img.altText ?? `Vue ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Colonne infos ── */}
          <div className="flex flex-col gap-6 lg:pt-2">
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-gray-500"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="mt-2 text-base text-gray-500">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {product.description && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {variants.length > 0 ? (
              <div className="border-t border-gray-100 pt-4 space-y-6">
                <VariantSelector
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onSelect={setSelectedVariant}
                />
                {selectedVariant && (
                  <QuantitySelector
                    variant={selectedVariant}
                    productName={product.name}
                    onAddToCart={handleAddToCart}
                  />
                )}
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm italic text-gray-400">
                  Aucune variante disponible pour le moment.
                </p>
              </div>
            )}

            <div className="rounded-xl bg-gray-50 p-5 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                À propos de l'impression
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                Chaque œuvre est imprimée à la demande, sur des supports soigneusement
                sélectionnés. Les délais de fabrication sont de 5 à 7 jours ouvrés.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Produits similaires ── */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-16 lg:px-12">
          <div className="mb-8 border-t border-gray-100 pt-10">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900">
              Autres œuvres
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Vous pourriez également aimer
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                primaryImage={relatedImages[p.id]}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}