import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SideMenu, type MenuItem } from '../navigation/SideMenu'
import { SearchDropdown } from '../search/SearchDropdown'
import { cn } from '@/lib/utils'
import { useAuth, useCart } from '@/hooks'
import { SearchIcon } from '@/components/ui/search'
import { UserIcon } from '@/components/ui/user'
import { HeartIcon } from '@/components/ui/heart'
import { CartIcon as AnimatedCartIcon } from '@/components/ui/cart'

const menuItems: MenuItem[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Galerie', href: '/galerie', hasSubmenu: true },
  { label: "L'Artiste", href: '/artiste' },
  { label: 'Contact', href: '/contact' },
]

interface HeaderProps {
  forceTransparent?: boolean
}

export function Header({ forceTransparent = false }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated } = useAuth()
  const { itemCount } = useCart()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function closeSearch() {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const isOnHero = forceTransparent && !isScrolled
  const textColor = isOnHero ? '#ffffff' : '#1a1a1a'

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          'mx-auto max-w-6xl rounded-2xl transition-all duration-500',
          isOnHero
            ? 'border border-white/20 bg-white/10'
            : 'border border-white/40 bg-white/60',
        )}
        style={{
          backdropFilter: isOnHero
            ? 'blur(16px) saturate(180%)'
            : 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: isOnHero
            ? 'blur(16px) saturate(180%)'
            : 'blur(20px) saturate(200%)',
          boxShadow: isOnHero
            ? '0 8px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)'
            : '0 8px 32px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.6)',
        }}
      >
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">

          {/* ── Gauche : Menu ── */}
          <div className="flex items-center">
            <SideMenu
              items={menuItems}
              position="left"
              menuButtonColor={textColor}
              openMenuButtonColor="#111111"
              accentColor="#111111"
              closeOnClickAway={true}
            />
          </div>

          {/* ── Centre : Logo ── */}
          <Link
            to="/"
            className={cn(
              'absolute left-1/2 -translate-x-1/2',
              'text-lg font-light uppercase tracking-[0.15em] lg:text-xl',
              'transition-colors duration-300 hover:opacity-70',
            )}
            style={{ color: textColor }}
          >
            Art Shop
          </Link>

          {/* ── Droite : Icônes ── */}
          <div className="flex items-center gap-1" style={{ color: textColor }}>

            {/* ── Recherche ── */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.form
                    key="search-input"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    onSubmit={(e) => e.preventDefault()}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher une œuvre, un tag…"
                      autoFocus
                      className={cn(
                        'h-8 w-48 rounded-full border border-gray-200/50 bg-white/80 px-3 pr-8',
                        'text-sm text-gray-900 placeholder:text-gray-400',
                        'backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-gray-300',
                        'sm:w-64',
                      )}
                    />
                    <button
                      type="button"
                      onClick={closeSearch}
                      className="absolute right-2 text-gray-400 hover:text-gray-600"
                      aria-label="Fermer la recherche"
                    >
                      <XIcon size={14} />
                    </button>

                    {searchQuery.trim().length >= 2 && (
                      <SearchDropdown
                        query={searchQuery}
                        onClose={closeSearch}
                      />
                    )}
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="rounded-full p-2 transition-colors duration-200 hover:bg-black/5"
                    aria-label="Rechercher"
                  >
                    <SearchIcon size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ── Profil ── */}
            <Link
              to={isAuthenticated ? '/profil' : '/login'}
              className="rounded-full p-2 transition-colors duration-200 hover:bg-black/5"
              aria-label={isAuthenticated ? 'Mon profil' : 'Se connecter'}
            >
              <UserIcon size={18} />
            </Link>

            {/* ── Favoris (desktop uniquement) ── */}
            <Link
              to="/favoris"
              className="hidden rounded-full p-2 transition-colors duration-200 hover:bg-black/5 sm:flex"
              aria-label="Favoris"
            >
              <HeartIcon size={18} />
            </Link>

            {/* ── Panier avec badge ── */}
            <Link
              to="/panier"
              className="relative rounded-full p-2 transition-colors duration-200 hover:bg-black/5"
              aria-label={`Panier (${itemCount} article${itemCount > 1 ? 's' : ''})`}
            >
              <AnimatedCartIcon size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[9px] font-medium text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>
    </header>
  )
}