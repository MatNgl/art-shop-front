import { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ChevronDown } from 'lucide-react'
import type { CategoryWithSubcategories, Format } from '@/types'
import { getCategoriesWithSubcategories } from '@/services/categories.service'
import { getFormats } from '@/services/formats.service'

export interface MenuItem {
  label: string
  href: string
  hasSubmenu?: boolean
}

export interface SideMenuProps {
  items: MenuItem[]
  position?: 'left' | 'right'
  colors?: string[]
  menuButtonColor?: string
  openMenuButtonColor?: string
  accentColor?: string
  closeOnClickAway?: boolean
  className?: string
}

export function SideMenu({
  items,
  position = 'left',
  colors = ['#e5e5e5', '#f0f0f0'],
  menuButtonColor = '#111',
  openMenuButtonColor = '#111',
  accentColor = '#111',
  closeOnClickAway = true,
  className = '',
}: SideMenuProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
  const [formats, setFormats] = useState<Format[]>([])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [textLines, setTextLines] = useState<string[]>(['Menu', 'Fermer'])
  const [mounted, setMounted] = useState(false)

  const openRef = useRef(false)
  const busyRef = useRef(false)

  const navigate = useNavigate()
  const location = useLocation()

  const panelRef = useRef<HTMLDivElement | null>(null)
  const preLayersRef = useRef<HTMLDivElement | null>(null)
  const preLayerElsRef = useRef<HTMLElement[]>([])

  const plusHRef = useRef<HTMLSpanElement | null>(null)
  const plusVRef = useRef<HTMLSpanElement | null>(null)
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const textInnerRef = useRef<HTMLSpanElement | null>(null)
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null)

  const openTlRef = useRef<gsap.core.Timeline | null>(null)
  const closeTweenRef = useRef<gsap.core.Tween | null>(null)
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null)
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null)
  const colorTweenRef = useRef<gsap.core.Tween | null>(null)

  const safeColors = colors ?? ['#e5e5e5', '#f0f0f0']

  useEffect(() => {
    setMounted(true)
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [categoriesData, formatsData] = await Promise.all([
          getCategoriesWithSubcategories().catch(() => []),
          getFormats().catch(() => [])
        ])
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        setFormats(Array.isArray(formatsData) ? formatsData : [])
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        setCategories([])
        setFormats([])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useLayoutEffect(() => {
    if (!mounted) return

    const ctx = gsap.context(() => {
      const panel = panelRef.current
      const preContainer = preLayersRef.current
      const plusH = plusHRef.current
      const plusV = plusVRef.current
      const icon = iconRef.current
      const textInner = textInnerRef.current

      if (plusH && plusV && icon && textInner) {
        gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 })
        gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 })
        gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
        gsap.set(textInner, { yPercent: 0 })
      }

      if (toggleBtnRef.current) {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor })
      }

      if (panel) {
        let preLayers: HTMLElement[] = []
        if (preContainer) {
          preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[]
        }
        preLayerElsRef.current = preLayers

        const offscreen = position === 'left' ? -100 : 100
        gsap.set([panel, ...preLayers], { xPercent: offscreen })
      }
    })

    return () => ctx.revert()
  }, [menuButtonColor, position, mounted])

  useEffect(() => {
    if (toggleBtnRef.current && !openRef.current) {
      gsap.to(toggleBtnRef.current, {
        color: menuButtonColor,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
  }, [menuButtonColor])

  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }, [])

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    closeTweenRef.current?.kill()
    closeTweenRef.current = null

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[]

    const layerStates = layers.map(el => ({
      el,
      start: Number(gsap.getProperty(el, 'xPercent'))
    }))
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'))

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 })

    const tl = gsap.timeline({ paused: true })

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.5, ease: 'power4.out' },
        i * 0.07
      )
    })

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0)
    const panelDuration = 0.65

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    )

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      )
    }

    openTlRef.current = tl
    return tl
  }, [])

  const playOpen = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true

    const tl = buildOpenTimeline()
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false
      })
      tl.play(0)
    } else {
      busyRef.current = false
    }
  }, [buildOpenTimeline])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    openTlRef.current = null
    setExpandedSections({})

    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return

    const all: HTMLElement[] = [...layers, panel]
    closeTweenRef.current?.kill()

    const offscreen = position === 'left' ? -100 : 100

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[]
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 })
        busyRef.current = false
      }
    })
  }, [position])

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current
    const h = plusHRef.current
    const v = plusVRef.current
    if (!icon || !h || !v) return

    spinTweenRef.current?.kill()

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0)
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0)
    }
  }, [])

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current
      if (!btn) return

      colorTweenRef.current?.kill()
      const targetColor = opening ? openMenuButtonColor : menuButtonColor
      colorTweenRef.current = gsap.to(btn, {
        color: targetColor,
        delay: 0.18,
        duration: 0.3,
        ease: 'power2.out'
      })
    },
    [openMenuButtonColor, menuButtonColor]
  )

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current
    if (!inner) return

    textCycleAnimRef.current?.kill()

    const currentLabel = opening ? 'Menu' : 'Fermer'
    const targetLabel = opening ? 'Fermer' : 'Menu'
    const cycles = 3

    const seq: string[] = [currentLabel]
    let last = currentLabel
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Fermer' : 'Menu'
      seq.push(last)
    }
    if (last !== targetLabel) seq.push(targetLabel)
    seq.push(targetLabel)

    setTextLines(seq)
    gsap.set(inner, { yPercent: 0 })

    const lineCount = seq.length
    const finalShift = ((lineCount - 1) / lineCount) * 100

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    })
  }, [])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)

    if (target) {
      playOpen()
    } else {
      playClose()
    }

    animateIcon(target)
    animateColor(target)
    animateText(target)
  }, [playOpen, playClose, animateIcon, animateColor, animateText])

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false
      setOpen(false)
      playClose()
      animateIcon(false)
      animateColor(false)
      animateText(false)
    }
  }, [playClose, animateIcon, animateColor, animateText])

  const handleNavigation = useCallback(
    (href: string) => {
      closeMenu()
      setTimeout(() => navigate(href), 200)
    },
    [closeMenu, navigate]
  )

  const handleCategoryNavigation = useCallback(
  (categorySlug: string) => {
    closeMenu()
    setTimeout(() => navigate(`/categorie/${categorySlug}`), 200)
  },
  [closeMenu, navigate]
)

  const handleFormatNavigation = useCallback(
    (formatId: string) => {
      closeMenu()
      setTimeout(() => navigate(`/galerie?format=${formatId}`), 200)
    },
    [closeMenu, navigate]
  )

  useEffect(() => {
    if (!closeOnClickAway || !open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeOnClickAway, open, closeMenu])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) closeMenu()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeMenu])

  const menuContent = (
    <>
      <div
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm z-998
          transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div
        ref={preLayersRef}
        className={`
          fixed top-0 bottom-0 z-999 pointer-events-none
          ${position === 'left' ? 'left-0' : 'right-0'}
        `}
        style={{ width: 'clamp(280px, 40vw, 420px)' }}
        aria-hidden="true"
      >
        {safeColors.map((color, i) => (
          <div
            key={i}
            className="sm-prelayer absolute inset-0"
            style={{ background: color }}
          />
        ))}
      </div>

      <aside
        ref={panelRef}
        className={`
          fixed top-0 bottom-0 z-1000
          bg-white flex flex-col
          overflow-hidden shadow-2xl
          ${position === 'left' ? 'left-0' : 'right-0'}
        `}
        style={{
          width: 'clamp(280px, 40vw, 420px)',
          '--sm-accent': accentColor,
        } as React.CSSProperties}
        aria-hidden={!open}
      >
        {/*  Header du panel avec bouton Fermer  */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">
            Navigation
          </span>
          <button
            onClick={closeMenu}
            className="
              flex items-center gap-1.5
              text-xs font-medium text-gray-400
              hover:text-gray-900 transition-colors duration-200
              bg-transparent border-0 cursor-pointer
              uppercase tracking-[0.12em]
            "
            aria-label="Fermer le menu"
          >
            Fermer
            <span className="text-[10px]">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <ul className="list-none m-0 p-0 flex flex-col gap-1">
            {items.map((item, idx) => {
              const isActive = location.pathname === item.href
              const hasSubmenu = item.hasSubmenu === true
              const isExpanded = expandedSections[item.href]

              return (
                <li
                  key={item.href}
                  className="sm-panel-itemWrap relative overflow-visible leading-none"
                >
                  <div className="flex items-center group">
                    <button
                      onClick={() => {
                        if (hasSubmenu) {
                          toggleSection(item.href)
                        } else {
                          handleNavigation(item.href)
                        }
                      }}
                      className={`
                        sm-panel-item
                        relative text-left flex-1
                        text-[clamp(1.8rem,4vw,2.5rem)] font-semibold
                        leading-none tracking-[-0.02em] uppercase
                        py-3 pr-12
                        cursor-pointer
                        transition-colors duration-150
                        bg-transparent border-0
                        flex items-center gap-3
                        ${isActive
                          ? 'text-(--sm-accent)'
                          : 'text-gray-900 hover:text-(--sm-accent)'
                        }
                      `}
                      data-index={idx + 1}
                    >
                      <span className="sm-panel-itemLabel inline-block origin-bottom-left will-change-transform">
                        {item.label}
                      </span>
                      {hasSubmenu && (
                        <ChevronDown
                          size={20}
                          strokeWidth={2}
                          className={`
                            transition-transform duration-300 text-gray-400
                            ${isExpanded ? 'rotate-180' : ''}
                          `}
                        />
                      )}
                    </button>
                    {hasSubmenu && (
                      <button
                        onClick={() => handleNavigation(item.href)}
                        className="
                          text-xs text-gray-400 hover:text-(--sm-accent)
                          transition-all px-2 py-2
                          opacity-0 group-hover:opacity-100
                          bg-transparent border-0 cursor-pointer
                        "
                      >
                        Tout →
                      </button>
                    )}
                  </div>

                  {hasSubmenu && (
                    <div
                      className={`
                        overflow-hidden transition-all duration-400 ease-out
                        ${isExpanded ? 'max-h-800px opacity-100' : 'max-h-0 opacity-0'}
                      `}
                    >
                      <div className="pl-4 pb-4 pt-2 space-y-6 border-l-2 border-gray-100 ml-1">

                        {/*  CATÉGORIES  */}
                        <div>
                          <button
                            onClick={() => handleNavigation('/galerie')}
                            className="
                              text-[10px] font-bold uppercase tracking-[0.15em]
                              text-(--sm-accent) hover:opacity-70
                              mb-3 flex items-center gap-1
                              transition-opacity bg-transparent border-0 cursor-pointer
                            "
                          >
                            Catégories →
                          </button>

                          {isLoading ? (
                            <div className="text-sm text-gray-300 animate-pulse">Chargement...</div>
                          ) : categories.length > 0 ? (
                            <div className="space-y-3">
                              {categories.map((category) => (
                                <div key={category.id}>
                                  <button
                                    onClick={() => handleCategoryNavigation(category.slug)}
                                    className="
                                      text-base font-semibold text-gray-700
                                      hover:text-gray-900 transition-all duration-150
                                      bg-transparent border-0 cursor-pointer
                                      py-1 w-full text-left hover:translate-x-1
                                    "
                                  >
                                    {category.name}
                                  </button>

                                  {category.subcategories.length > 0 && (
                                    <div className="pl-3 mt-1 space-y-0.5 border-l border-gray-100">
                                      {category.subcategories.map((sub) => (
                                        <button
                                          key={sub.id}
                                          onClick={() => {
                                            closeMenu()
                                            setTimeout(() => {
                                              navigate(`/categorie/${category.slug}?sous-categorie=${sub.slug}`)
                                            }, 200)
                                          }}
                                          className="
                                            text-sm font-normal text-gray-400
                                            hover:text-gray-700 transition-all duration-150
                                            bg-transparent border-0 cursor-pointer
                                            py-1 w-full text-left hover:translate-x-1
                                          "
                                        >
                                          {sub.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic m-0">Aucune catégorie</p>
                          )}
                        </div>

                        {/*  FORMATS  */}
                        <div>
                          <button
                            onClick={() => handleNavigation('/galerie?view=formats')}
                            className="
                              text-[10px] font-bold uppercase tracking-[0.15em]
                              text-(--sm-accent) hover:opacity-70
                              mb-3 flex items-center gap-1
                              transition-opacity bg-transparent border-0 cursor-pointer
                            "
                          >
                            Formats →
                          </button>

                          {isLoading ? (
                            <div className="text-sm text-gray-300 animate-pulse">Chargement...</div>
                          ) : formats.length > 0 ? (
                            <div className="space-y-1">
                              {formats.map((format) => (
                                <button
                                  key={format.id}
                                  onClick={() => handleFormatNavigation(format.id)}
                                  className="
                                    text-base font-medium text-gray-600
                                    hover:text-gray-900 transition-all duration-150
                                    bg-transparent border-0 cursor-pointer
                                    py-1.5 flex items-center gap-2 w-full text-left hover:translate-x-1
                                  "
                                >
                                  <span>{format.name}</span>
                                  {format.widthMm > 0 && format.heightMm > 0 && (
                                    <span className="text-xs text-gray-400 font-normal ml-auto">
                                      {format.widthMm}×{format.heightMm}mm
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic m-0">Aucun format</p>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="px-8 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 tracking-wide m-0">
            © {new Date().getFullYear()} Art Shop
          </p>
        </div>
      </aside>
    </>
  )

  return (
    <>
      <button
        ref={toggleBtnRef}
        className={`
          sm-toggle relative inline-flex items-center gap-2
          bg-transparent border-0 cursor-pointer
          font-medium text-sm leading-none
          overflow-visible z-1002
          ${className}
        `}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        onClick={toggleMenu}
        type="button"
      >
        <span className="relative inline-block h-[1em] overflow-hidden whitespace-nowrap w-[5em] text-right">
          <span ref={textInnerRef} className="flex flex-col leading-none items-end">
            {textLines.map((line, i) => (
              <span className="block h-[1em] leading-none" key={i}>
                {line}
              </span>
            ))}
          </span>
        </span>

        <span
          ref={iconRef}
          className="relative w-3.5 h-3.5 shrink-0 inline-flex items-center justify-center will-change-transform"
        >
          <span
            ref={plusHRef}
            className="absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded-sm -translate-x-1/2 -translate-y-1/2 will-change-transform"
          />
          <span
            ref={plusVRef}
            className="absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded-sm -translate-x-1/2 -translate-y-1/2 will-change-transform"
          />
        </span>
      </button>

      {mounted && createPortal(menuContent, document.body)}
    </>
  )
}

export default SideMenu