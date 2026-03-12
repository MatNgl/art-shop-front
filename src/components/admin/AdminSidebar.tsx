import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Grid3X3,
  Ruler,
  Paintbrush,
  Users,
  ShoppingCart,
  ScrollText,
  ArrowLeft,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Général',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Boutique',
    items: [
      { label: 'Commandes', href: '/admin/commandes', icon: ShoppingBag },
      { label: 'Paniers', href: '/admin/paniers', icon: ShoppingCart },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Produits', href: '/admin/produits', icon: Package },
      { label: 'Catégories', href: '/admin/categories', icon: Grid3X3 },
      { label: 'Tags', href: '/admin/tags', icon: Tag },
      { label: 'Formats', href: '/admin/formats', icon: Ruler },
      { label: 'Matériaux', href: '/admin/materiaux', icon: Paintbrush },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users },
      { label: 'Logs', href: '/admin/logs', icon: ScrollText },
    ],
  },
]

export function AdminSidebar() {
  const { pathname } = useLocation()

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <Link
          to="/admin"
          className="text-sm font-light uppercase tracking-[0.15em] text-gray-900"
        >
          Art Shop
          <span className="ml-2 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      )}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Retour au site
        </Link>
      </div>
    </aside>
  )
}