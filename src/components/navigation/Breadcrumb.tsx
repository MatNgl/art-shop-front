import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────

export interface BreadcrumbItem {
  /** Texte affiché */
  label: string
  /** URL de navigation (undefined = élément courant, non cliquable) */
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

// ── Composant ───────────────────────────────────

/**
 * Fil d'Ariane accessible et réutilisable.
 *
 * Le dernier élément est automatiquement marqué comme page courante
 * (aria-current="page") et n'est pas cliquable.
 *
 * @example
 * <Breadcrumb items={[
 *   { label: 'Accueil', href: '/' },
 *   { label: 'Galerie', href: '/galerie' },
 *   { label: 'Illustrations' },
 * ]} />
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn('flex items-center gap-1.5 text-sm', className)}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-1.5">
              {/* Séparateur (sauf pour le premier) */}
              {index > 0 && (
                <ChevronRight
                  size={14}
                  strokeWidth={1.5}
                  className="text-gray-300 flex-shrink-0"
                  aria-hidden="true"
                />
              )}

              {/* Lien ou texte courant */}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="text-gray-500 font-medium truncate max-w-[200px]"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-gray-400 hover:text-gray-700 transition-colors truncate max-w-[200px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}