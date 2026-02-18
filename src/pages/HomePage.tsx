import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { buttonVariants } from '@/components/ui/button'
import Iridescence from '@/components/backgrounds/Iridescence'
import { ProductCard } from '@/components/catalog/ProductCard'
import { cn } from '@/lib/utils'
import {
  getFeaturedProducts,
  getPublishedProducts,
  getProductImages,
  getProductVariants,
} from '@/services/products.service'
import { getCategoriesWithSubcategories } from '@/services/categories.service'
import type { Product, ProductImage, CategoryWithSubcategories, ProductVariant } from '@/types'

// ============================================
// ANIMATIONS
// ============================================

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// ============================================
// HELPERS
// ============================================

function getMinPrice(variants: ProductVariant[]): number | null {
  const available = variants.filter((v) => v.status === 'AVAILABLE')
  if (available.length === 0) return null
  return Math.min(...available.map((v) => Number(v.price)))
}

// ============================================
// COMPOSANTS DE SECTION
// ============================================

/** Section Hero avec background animé */
function HeroSection() {
  const scrollToContent = () => {
    const element = document.getElementById('artist-section')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <Iridescence color={[0.3, 0.3, 0.4]} speed={0.8} mouseReact={true} />
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.p
          variants={fadeInUp}
          className="text-white/80 text-sm tracking-[0.3em] uppercase mb-6"
        >
          Galerie d'art en ligne
        </motion.p>

        <motion.h1
          variants={fadeInUp}
          className="text-4xl sm:text-5xl md:text-7xl font-light text-white tracking-wide mb-6"
        >
          L'art qui raconte
          <br />
          <span className="font-normal">votre histoire</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-lg sm:text-xl text-white/80 font-light max-w-2xl mx-auto mb-10"
        >
          Découvrez des œuvres uniques, créées avec passion,
          pensées pour sublimer votre intérieur.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/galerie"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'bg-white text-gray-900 hover:bg-white/90 rounded-full px-8'
            )}
          >
            Explorer la galerie
            <ArrowRight className="ml-2" size={18} />
          </Link>

          <Link
            to="/artiste"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'border-white/30 text-white hover:bg-white/10 rounded-full px-8'
            )}
          >
            Découvrir l'artiste
          </Link>
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="Défiler vers le bas"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown size={32} strokeWidth={1} />
        </motion.div>
      </motion.button>
    </section>
  )
}

/** Section présentation de l'artiste */
function ArtistSection() {
  return (
    <section id="artist-section" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          <motion.div
            variants={fadeInUp}
            className="relative aspect-4/5 bg-gray-100 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Photo de l'artiste</span>
            </div>
          </motion.div>

          <div>
            <motion.p
              variants={fadeInUp}
              className="text-sm tracking-[0.2em] uppercase text-gray-500 mb-4"
            >
              À propos
            </motion.p>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-6"
            >
              L'artiste derrière
              <br />
              chaque création
            </motion.h2>

            <motion.div variants={fadeInUp} className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Passionné par les contrastes entre l'ombre et la lumière,
                je crée des œuvres qui invitent à la contemplation et à l'évasion.
              </p>
              <p>
                Chaque pièce est le fruit d'une réflexion profonde sur notre rapport
                au monde, à la nature et à nous-mêmes. Mon travail explore les frontières
                entre le réel et l'imaginaire.
              </p>
              <p>
                Toutes les œuvres sont imprimées à la demande sur des supports
                de qualité premium, garantissant une reproduction fidèle des couleurs
                et des détails.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-8">
              <Link
                to="/artiste"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'rounded-full'
                )}
              >
                En savoir plus
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/** Section œuvres en avant — branchée sur l'API */
function FeaturedSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [images, setImages] = useState<Record<string, ProductImage>>({})
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      try {
        // Tente d'abord les produits featured, sinon fallback sur published
        let fetched = await getFeaturedProducts().catch(() => [])

        if (fetched.length === 0) {
          const all = await getPublishedProducts().catch(() => [])
          fetched = all.slice(0, 3)
        } else {
          fetched = fetched.slice(0, 3)
        }

        if (cancelled) return
        setProducts(fetched)

        // Chargement parallèle images + prix
        const [imgResults, priceResults] = await Promise.all([
          Promise.allSettled(
            fetched.map((p) =>
              getProductImages(p.id).then((imgs) => ({
                productId: p.id,
                primary: imgs.find((i) => i.isPrimary) ?? imgs[0] ?? null,
              })),
            ),
          ),
          Promise.allSettled(
            fetched.map((p) =>
              getProductVariants(p.id).then((variants) => ({
                productId: p.id,
                minPrice: getMinPrice(variants),
              })),
            ),
          ),
        ])

        if (cancelled) return

        const imgMap: Record<string, ProductImage> = {}
        imgResults.forEach((r) => {
          if (r.status === 'fulfilled' && r.value.primary) {
            imgMap[r.value.productId] = r.value.primary
          }
        })
        setImages(imgMap)

        const priceMap: Record<string, number> = {}
        priceResults.forEach((r) => {
          if (r.status === 'fulfilled' && r.value.minPrice !== null) {
            priceMap[r.value.productId] = r.value.minPrice
          }
        })
        setPrices(priceMap)
      } catch {
        if (!cancelled) {
          toast.error('Impossible de charger les œuvres en vedette')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  // Ne rien afficher si aucun produit après chargement
  if (!loading && products.length === 0) return null

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm tracking-[0.2em] uppercase text-gray-500 mb-4"
          >
            Sélection
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900"
          >
            Œuvres en vedette
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <div className="animate-pulse">
                    <div className="aspect-4/5 rounded-xl bg-gray-200 mb-4" />
                    <div className="h-5 w-3/4 rounded bg-gray-200 mb-2" />
                    <div className="h-4 w-full rounded bg-gray-200" />
                  </div>
                </motion.div>
              ))
            : products.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard
                    product={product}
                    primaryImage={images[product.id]}
                    minPrice={prices[product.id]}
                  />
                </motion.div>
              ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            to="/galerie"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'rounded-full'
            )}
          >
            Voir toutes les œuvres
            <ArrowRight className="ml-2" size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/** Section catégories — branchée sur l'API */
function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      try {
        const fetched = await getCategoriesWithSubcategories()
        if (!cancelled) setCategories(fetched)
      } catch {
        // Silencieux — la section disparaît simplement
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  // Ne rien afficher si aucune catégorie
  if (!loading && categories.length === 0) return null

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm tracking-[0.2em] uppercase text-gray-500 mb-4"
          >
            Explorer
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900"
          >
            Parcourir par catégorie
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                </motion.div>
              ))
            : categories.map((category) => (
                <motion.div key={category.id} variants={fadeInUp}>
                  <Link
                    to={`/categorie/${category.slug}`}
                    className={cn(
                      'group block relative aspect-square rounded-2xl overflow-hidden',
                      'bg-gray-100'
                    )}
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
                    <div className={cn(
                      'absolute inset-0',
                      'bg-black/30 group-hover:bg-black/50',
                      'transition-all duration-300'
                    )} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <span className={cn(
                        'text-white text-lg sm:text-xl font-light tracking-wide',
                        'transform group-hover:scale-105',
                        'transition-transform duration-300'
                      )}>
                        {category.name}
                      </span>
                      {category.subcategories.length > 0 && (
                        <span className="text-white/60 text-xs">
                          {category.subcategories.length} sous-catégorie{category.subcategories.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
        </motion.div>
      </div>
    </section>
  )
}

/** Section CTA finale */
function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6"
          >
            Prêt à sublimer
            <br />
            votre intérieur ?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-white/70 mb-10 max-w-2xl mx-auto"
          >
            Chaque œuvre est imprimée avec soin sur des matériaux premium.
            Livraison soignée dans toute la France.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <Link
              to="/galerie"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-white text-gray-900 hover:bg-white/90 rounded-full px-10'
              )}
            >
              Découvrir la collection
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// PAGE PRINCIPALE
// ============================================

export function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header forceTransparent />
      <HeroSection />
      <ArtistSection />
      <FeaturedSection />
      <CategoriesSection />
      <CTASection />
      <Footer />
    </div>
  )
}