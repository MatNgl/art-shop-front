import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard, ProductCardSkeleton } from '@/components/catalog/ProductCard'
import { getCategoriesWithSubcategories } from '@/services/categories.service'
import { getPublishedProducts, getProductImages } from '@/services/products.service'
import type { Product, ProductImage, CategoryWithSubcategories } from '@/types'

// Map productId → image principale
type PrimaryImageMap = Record<string, ProductImage>

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [primaryImages, setPrimaryImages] = useState<PrimaryImageMap>({})
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
  const [loading, setLoading] = useState(true)

  const activeCategory = searchParams.get('categorie')
  const activeSubcategory = searchParams.get('sous-categorie')

  // ── Chargement initial ────────────────────────────────
  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getPublishedProducts(),
          getCategoriesWithSubcategories().catch(() => []),
        ])

        setProducts(fetchedProducts)
        setCategories(fetchedCategories)

        // Chargement des images en parallèle (non bloquant)
        void loadPrimaryImages(fetchedProducts)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  async function loadPrimaryImages(prods: Product[]): Promise<void> {
    const results = await Promise.allSettled(
      prods.map((p) =>
        getProductImages(p.id).then((imgs) => ({
          productId: p.id,
          primary: imgs.find((i) => i.isPrimary) ?? imgs[0] ?? null,
        })),
      ),
    )

    const map: PrimaryImageMap = {}
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.primary) {
        map[r.value.productId] = r.value.primary
      }
    })
    setPrimaryImages(map)
  }

  // ── Filtrage client par catégorie ou sous-catégorie ──────
  // Fonctionne grâce aux relations `categories` et `subcategories`
  // désormais incluses dans la réponse de GET /products/published.
  const filteredProducts = useMemo(() => {
    if (!activeCategory && !activeSubcategory) return products

    return products.filter((product) => {
      if (activeSubcategory) {
        return (
          product.subcategories?.some((sub) => sub.slug === activeSubcategory) ??
          false
        )
      }
      if (activeCategory) {
        return (
          product.categories?.some((cat) => cat.slug === activeCategory) ??
          false
        )
      }
      return true
    })
  }, [products, activeCategory, activeSubcategory])

  // ── Rendu ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white">
      {/* ── Header ── */}
      <section className="px-6 pb-8 pt-16 md:px-12 lg:px-20">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          Galerie
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {loading
            ? '…'
            : `${filteredProducts.length} œuvre${filteredProducts.length > 1 ? 's' : ''}`}
        </p>
      </section>

      {/* ── Filtres catégories ── */}
      {!loading && categories.length > 0 && (
        <nav className="sticky top-20 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-sm px-6 md:px-12 lg:px-20">
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
                onClick={() => setSearchParams({ categorie: cat.slug })}
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

        {/* ── Grille produits ── */}
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