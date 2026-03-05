import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getPublishedProducts } from '@/services/products.service'
import type { Product } from '@/types'

//  Types internes 

type ResultKind = 'product' | 'category' | 'subcategory' | 'tag'

interface SearchResult {
  kind: ResultKind
  label: string
  sublabel?: string
  href: string
}

const KIND_LABELS: Record<ResultKind, string> = {
  product: 'Œuvres',
  category: 'Catégories',
  subcategory: 'Sous-catégories',
  tag: 'Tags',
}

//  Helpers

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matches(value: string, query: string): boolean {
  return normalize(value).includes(normalize(query))
}

//  Cache module-level (survit aux re-renders) ─
let cachedProducts: Product[] | null = null

async function getProductsWithCache(): Promise<Product[]> {
  if (cachedProducts !== null) return cachedProducts
  cachedProducts = await getPublishedProducts()
  return cachedProducts
}

function buildResults(products: Product[], query: string): SearchResult[] {
  if (query.trim().length < 2) return []

  const results: SearchResult[] = []
  const seenCategories = new Set<string>()
  const seenSubcategories = new Set<string>()
  const seenTags = new Set<string>()

  for (const product of products) {
    if (matches(product.name, query)) {
      results.push({
        kind: 'product',
        label: product.name,
        sublabel: product.shortDescription ?? undefined,
        href: `/oeuvre/${product.slug}`,
      })
    }

    if (product.categories) {
      for (const cat of product.categories) {
        if (!seenCategories.has(cat.id) && matches(cat.name, query)) {
          seenCategories.add(cat.id)
          results.push({
            kind: 'category',
            label: cat.name,
            href: `/galerie?categorie=${cat.slug}`,
          })
        }
      }
    }

    if (product.subcategories) {
      for (const sub of product.subcategories) {
        if (!seenSubcategories.has(sub.id) && matches(sub.name, query)) {
          seenSubcategories.add(sub.id)
          results.push({
            kind: 'subcategory',
            label: sub.name,
            href: `/galerie?sous-categorie=${sub.slug}`,
          })
        }
      }
    }

    for (const tag of product.tags) {
      if (!seenTags.has(tag.id) && tag.name && matches(tag.name, query)) {
        seenTags.add(tag.id)
        results.push({
          kind: 'tag',
          label: tag.name,
          href: `/galerie?tag=${tag.slug}`,
        })
      }
    }
  }

  return results.slice(0, 12)
}

//  Composant

interface SearchDropdownProps {
  query: string
  onClose: () => void
}

export function SearchDropdown({ query, onClose }: SearchDropdownProps) {
  const navigate = useNavigate()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loadingCache, setLoadingCache] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Charge le cache si nécessaire puis calcule les résultats.
  // Tous les setState sont à l'intérieur de la fonction async,
  // jamais directement dans le corps de l'effet.
  useEffect(() => {
    let cancelled = false

    async function run(): Promise<void> {
      const needsLoad = cachedProducts === null

      if (needsLoad) {
        setLoadingCache(true)
      }

      const products = await getProductsWithCache()

      if (cancelled) return

      if (needsLoad) {
        setLoadingCache(false)
      }

      setResults(buildResults(products, query))
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [query])

  const handleSelect = useCallback(
    (href: string) => {
      onClose()
      navigate(href)
    },
    [navigate, onClose],
  )

  const grouped = results.reduce<Partial<Record<ResultKind, SearchResult[]>>>(
    (acc, r) => {
      if (!acc[r.kind]) acc[r.kind] = []
      acc[r.kind]!.push(r)
      return acc
    },
    {},
  )

  const hasResults = results.length > 0
  const showEmpty = query.trim().length >= 2 && !loadingCache && !hasResults

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
      >
        {loadingCache && (
          <div className="flex items-center justify-center py-6">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
          </div>
        )}

        {showEmpty && (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            Aucun résultat pour «&nbsp;{query}&nbsp;»
          </div>
        )}

        {hasResults && (
          <div className="max-h-96 overflow-y-auto py-2">
            {(Object.entries(grouped) as [ResultKind, SearchResult[]][]).map(
              ([kind, items]) => (
                <div key={kind}>
                  <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {KIND_LABELS[kind]}
                  </p>

                  {items.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleSelect(item.href)}
                      className="flex w-full flex-col px-4 py-2 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {item.label}
                      </span>
                      {item.sublabel && (
                        <span className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                          {item.sublabel}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ),
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}