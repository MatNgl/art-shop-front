// src/components/layout/Header.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, User, Heart, ShoppingBag, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SideMenu, type MenuItem } from '../navigation/SideMenu'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks'

const menuItems: MenuItem[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Galerie', href: '/galerie', hasSubmenu: true },
  { label: 'L\'Artiste', href: '/artiste' },
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Recherche:', searchQuery)
    }
  }

  // Mode transparent sur le hero, glassmorphism léger après scroll
  const isOnHero = forceTransparent && !isScrolled
  const textColor = isOnHero ? '#ffffff' : '#1a1a1a'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <div
        className={cn(
          'max-w-6xl mx-auto rounded-2xl transition-all duration-500',
          isOnHero
            ? 'bg-white/10 border border-white/20'
            : 'bg-white/60 border border-white/40'
        )}
        style={{
          backdropFilter: isOnHero ? 'blur(16px) saturate(180%)' : 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: isOnHero ? 'blur(16px) saturate(180%)' : 'blur(20px) saturate(200%)',
          boxShadow: isOnHero 
            ? '0 8px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)' 
            : '0 8px 32px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.6)',
        }}
      >
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          {/* Gauche : Menu */}
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

          {/* Centre : Logo */}
          <Link
            to="/"
            className={cn(
              'absolute left-1/2 -translate-x-1/2',
              'text-lg lg:text-xl font-light tracking-[0.15em] uppercase',
              'transition-colors duration-300',
              'hover:opacity-70'
            )}
            style={{ color: textColor }}
          >
            Art Shop
          </Link>

          {/* Droite : Icônes */}
          <div className="flex items-center gap-1">
            {/* Recherche */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.form
                    key="search-input"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    onSubmit={handleSearch}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      autoFocus
                      className={cn(
                        'w-36 sm:w-48 h-8 px-3 pr-8',
                        'text-sm text-gray-900 placeholder:text-gray-400',
                        'bg-white/80 backdrop-blur-sm',
                        'border border-gray-200/50 rounded-full',
                        'focus:outline-none focus:ring-1 focus:ring-gray-300',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="absolute right-2 p-0.5 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-full transition-colors duration-200 hover:bg-black/5"
                    style={{ color: textColor }}
                    aria-label="Rechercher"
                  >
                    <Search size={18} strokeWidth={1.5} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Profil */}
            <Link
              to={isAuthenticated ? '/compte' : '/login'}
              className="p-2 rounded-full transition-colors duration-200 hover:bg-black/5"
              style={{ color: textColor }}
              aria-label={isAuthenticated ? 'Mon compte' : 'Se connecter'}
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            {/* Favoris (desktop) */}
            <Link
              to="/favoris"
              className="hidden sm:flex p-2 rounded-full transition-colors duration-200 hover:bg-black/5"
              style={{ color: textColor }}
              aria-label="Favoris"
            >
              <Heart size={18} strokeWidth={1.5} />
            </Link>

            {/* Panier */}
            <Link
              to="/panier"
              className="p-2 rounded-full transition-colors duration-200 hover:bg-black/5"
              style={{ color: textColor }}
              aria-label="Panier"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}