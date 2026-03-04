import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ProductCard, ProductCardSkeleton } from '@/components/catalog'
import { getCategoriesWithSubcategories } from '@/services/categories.service'
import { Breadcrumb } from '@/components/navigation'
import { useCatalogueBreadcrumb } from '@/hooks'
import {
  getPublishedProducts,
  getProductImages,
  getProductVariants,
} from '@/services/products.service'
import type {
  Product,
  ProductImage,
  ProductVariant,
  CategoryWithSubcategories,
} from '@/types'

// ── Types locaux ────────────────────────────────

type PrimaryImageMap = Record<string, ProductImage>
type MinPriceMap = Record<string, number>

// Délai minimum d'affichage du skeleton (ms)
const MIN_LOADING_MS = 600

// ── Helper ──────────────────────────────────────

function computeMinPrice(variants: ProductVariant[]): number | null {
  const available = variants.filter((v) => v.status === 'AVAILABLE')
  if (available.length === 0) return null
  return Math.min(...available.map((v) => Number(v.price)))
}

// ── Page Catalogue ──────────────────────────────

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [primaryImages, setPrimaryImages] = useState<PrimaryImageMap>({})
  const [minPrices, setMinPrices] = useState<MinPriceMap>({})
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const activeCategory = searchParams.get('categorie')
  const activeSubcategory = searchParams.get('sous-categorie')
  const breadcrumbItems = useCatalogueBreadcrumb({
    categories,
    activeCategory,
    activeSubcategory,
  })
  // ── Chargement initial ──────────────────────────
  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      const start = Date.now()

      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getPublishedProducts(),
          getCategoriesWithSubcategories().catch(() => {
            if (!cancelled) {
              toast.error('Impossible de charger les catégories', {
                description: 'Le filtrage peut être temporairement indisponible.',
              })
            }
            return [] as CategoryWithSubcategories[]
          }),
        ])

        if (cancelled) return

        setProducts(fetchedProducts)
        setCategories(fetchedCategories)

        // Chargement parallèle images + prix (non bloquant pour l'affichage)
        void loadPrimaryImages(fetchedProducts, cancelled)
        void loadMinPrices(fetchedProducts, cancelled)
      } catch {
        if (!cancelled) {
          setProducts([])
          toast.error('Impossible de charger les œuvres', {
            description: 'Vérifiez votre connexion et réessayez.',
          })
        }
      } finally {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, MIN_LOADING_MS - elapsed)

        setTimeout(() => {
          if (!cancelled) setLoading(false)
        }, remaining)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  // ── Chargement images principales ───────────────
  async function loadPrimaryImages(
    prods: Product[],
    cancelled: boolean,
  ): Promise<void> {
    const results = await Promise.allSettled(
      prods.map((p) =>
        getProductImages(p.id).then((imgs) => ({
          productId: p.id,
          primary: imgs.find((i) => i.isPrimary) ?? imgs[0] ?? null,
        })),
      ),
    )

    if (cancelled) return

    const map: PrimaryImageMap = {}
    let failCount = 0

    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.primary) {
        map[r.value.productId] = r.value.primary
      } else if (r.status === 'rejected') {
        failCount++
      }
    })

    setPrimaryImages(map)

    if (failCount > 0 && failCount === prods.length) {
      toast.error('Impossible de charger les images', {
        description: 'Les visuels peuvent ne pas s\'afficher correctement.',
      })
    }
  }

  // ── Chargement prix minimum ─────────────────────
  async function loadMinPrices(
    prods: Product[],
    cancelled: boolean,
  ): Promise<void> {
    const results = await Promise.allSettled(
      prods.map((p) =>
        getProductVariants(p.id).then((variants) => ({
          productId: p.id,
          minPrice: computeMinPrice(variants),
        })),
      ),
    )

    if (cancelled) return

    const map: MinPriceMap = {}
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.minPrice !== null) {
        map[r.value.productId] = r.value.minPrice
      }
    })

    setMinPrices(map)
  }

  // ── Filtrage client ─────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!activeCategory && !activeSubcategory) return products

    return products.filter((product) => {
      if (activeSubcategory) {
        return product.subcategories?.some(
          (sub) => sub.slug === activeSubcategory,
        ) ?? false
      }
      if (activeCategory) {
        return product.categories?.some(
          (cat) => cat.slug === activeCategory,
        ) ?? false
      }
      return true
    })
  }, [products, activeCategory, activeSubcategory])

  // ── Rendu ──────────────────────────────────────
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 pb-8 pt-16 md:px-12 lg:px-20">
         {!loading && <Breadcrumb items={breadcrumbItems} className="mb-4" />}

        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          Galerie
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {loading
            ? '\u2026'
            : `${filteredProducts.length} œuvre${filteredProducts.length > 1 ? 's' : ''}`}
        </p>
      </section>

      {!loading && categories.length > 0 && (
        <nav className="sticky top-20 z-10 border-b border-gray-100 bg-white/90 px-6 backdrop-blur-sm md:px-12 lg:px-20">
          <div className="flex gap-6 overflow-x-auto py-3 scrollbar-none">
            <button
              onClick={() => setSearchParams({})}
              className={`whitespace-nowrap text-sm font-medium transition-colors ${
                !activeCategory && !activeSubcategory
                  ? 'border-b-2 border-gray-900 pb-1 text-gray-900'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/categorie/${cat.slug}`)}
                className={`whitespace-nowrap text-sm font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? 'border-b-2 border-gray-900 pb-1 text-gray-900'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <section className="px-6 py-10 md:px-12 lg:px-20">
        <div className="grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-4 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  primaryImage={primaryImages[product.id]}
                  minPrice={minPrices[product.id]}
                />
              ))}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="text-lg font-medium text-gray-400">
              Aucune œuvre disponible pour le moment.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}