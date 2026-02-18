import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Breadcrumb, type BreadcrumbItem } from '@/components/navigation/Breadcrumb'
import { ProductCard, ProductCardSkeleton } from '@/components/catalog/ProductCard'
import {
  getPublishedProducts,
  getProductImages,
  getProductVariants,
} from '@/services/products.service'
import { getCategoriesWithSubcategories } from '@/services/categories.service'
import type {
  Product,
  ProductImage,
  ProductVariant,
  CategoryWithSubcategories,
  Subcategory,
} from '@/types'

// ── Types locaux ────────────────────────────────

type PrimaryImageMap = Record<string, ProductImage>
type MinPriceMap = Record<string, number>

const MIN_LOADING_MS = 600

// ── Helpers ─────────────────────────────────────

function computeMinPrice(variants: ProductVariant[]): number | null {
  const available = variants.filter((v) => v.status === 'AVAILABLE')
  if (available.length === 0) return null
  return Math.min(...available.map((v) => Number(v.price)))
}

// ── Page ─────────────────────────────────────────

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<CategoryWithSubcategories | null>(null)
  const [primaryImages, setPrimaryImages] = useState<PrimaryImageMap>({})
  const [minPrices, setMinPrices] = useState<MinPriceMap>({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const activeSubcategory = searchParams.get('sous-categorie')

  // ── Chargement ──────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      const start = Date.now()

      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getPublishedProducts(),
          getCategoriesWithSubcategories(),
        ])

        if (cancelled) return

        // Trouve la catégorie correspondant au slug
        const found = fetchedCategories.find((c) => c.slug === slug) ?? null

        if (!found) {
          setNotFound(true)
          return
        }

        setCategory(found)

        // Filtre les produits appartenant à cette catégorie
        const categoryProducts = fetchedProducts.filter((p) =>
          p.categories?.some((c) => c.slug === slug),
        )

        setAllProducts(categoryProducts)

        // Chargement parallèle images + prix
        void loadPrimaryImages(categoryProducts, cancelled)
        void loadMinPrices(categoryProducts, cancelled)
      } catch {
        if (!cancelled) {
          toast.error('Impossible de charger la catégorie', {
            description: 'Vérifiez votre connexion et réessayez.',
          })
          setNotFound(true)
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
  }, [slug])

  // ── Chargement images ───────────────────────────
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
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.primary) {
        map[r.value.productId] = r.value.primary
      }
    })

    setPrimaryImages(map)
  }

  // ── Chargement prix ─────────────────────────────
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

  // ── Filtrage par sous-catégorie ─────────────────
  const filteredProducts = useMemo(() => {
    if (!activeSubcategory) return allProducts

    return allProducts.filter((product) =>
      product.subcategories?.some((sub) => sub.slug === activeSubcategory) ?? false,
    )
  }, [allProducts, activeSubcategory])

  // ── Breadcrumb ──────────────────────────────────
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Accueil', href: '/' },
      { label: 'Galerie', href: '/galerie' },
    ]

    if (!category) return items

    if (activeSubcategory) {
      items.push({
        label: category.name,
        href: `/categorie/${category.slug}`,
      })

      const sub = category.subcategories.find((s) => s.slug === activeSubcategory)
      items.push({ label: sub?.name ?? activeSubcategory })
    } else {
      items.push({ label: category.name })
    }

    return items
  }, [category, activeSubcategory])

  // ── Not Found ───────────────────────────────────
  if (!loading && notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="text-lg font-medium text-gray-400">
          Catégorie introuvable
        </p>
        <Link
          to="/galerie"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour à la galerie
        </Link>
      </main>
    )
  }

  // ── Rendu ───────────────────────────────────────
  return (
    <main className="min-h-screen bg-white">
      {/* Header catégorie */}
      <section className="px-6 pb-8 pt-16 md:px-12 lg:px-20">
        {!loading && <Breadcrumb items={breadcrumbItems} className="mb-4" />}

        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          {loading ? '\u00A0' : category?.name}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {loading
            ? '\u2026'
            : `${filteredProducts.length} œuvre${filteredProducts.length > 1 ? 's' : ''}`}
        </p>
      </section>

      {/* Filtres sous-catégories */}
      {!loading && category && category.subcategories.length > 0 && (
        <nav className="sticky top-20 z-10 border-b border-gray-100 bg-white/90 px-6 backdrop-blur-sm md:px-12 lg:px-20">
          <div className="flex gap-6 overflow-x-auto py-3 scrollbar-none">
            <button
              onClick={() => setSearchParams({})}
              className={`whitespace-nowrap text-sm font-medium transition-colors ${
                !activeSubcategory
                  ? 'border-b-2 border-gray-900 pb-1 text-gray-900'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Tout
            </button>
            {category.subcategories
              .sort((a: Subcategory, b: Subcategory) => a.position - b.position)
              .map((sub: Subcategory) => (
                <button
                  key={sub.id}
                  onClick={() => setSearchParams({ 'sous-categorie': sub.slug })}
                  className={`whitespace-nowrap text-sm font-medium transition-colors ${
                    activeSubcategory === sub.slug
                      ? 'border-b-2 border-gray-900 pb-1 text-gray-900'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
          </div>
        </nav>
      )}

      {/* Grille produits */}
      <section className="px-6 py-10 md:px-12 lg:px-20">
        <div className="grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-4 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
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
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-lg font-medium text-gray-400">
              Aucune œuvre dans cette catégorie.
            </p>
            <Link
              to="/galerie"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Voir toute la galerie
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}