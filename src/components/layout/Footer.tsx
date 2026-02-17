import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FooterLink {
  label: string
  href: string
}

const navigationLinks: FooterLink[] = [
  { label: 'Galerie', href: '/galerie' },
  { label: 'Collections', href: '/collections' },
  { label: 'L\'Artiste', href: '/artiste' },
  { label: 'Contact', href: '/contact' },
]

const legalLinks: FooterLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Politique de confidentialité', href: '/confidentialite' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Colonne 1 : Branding */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="text-xl font-light tracking-[0.15em] uppercase text-gray-900"
            >
              Art Shop
            </Link>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              Galerie d'art en ligne dédiée à la création contemporaine.
              Chaque œuvre raconte une histoire unique.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:contact@artshop.fr"
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Colonne 2 : Navigation */}
          <div>
            <h3 className="text-xs font-medium tracking-wider uppercase text-gray-900 mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={cn(
                      'text-sm text-gray-600 hover:text-gray-900',
                      'transition-colors duration-200'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Informations */}
          <div>
            <h3 className="text-xs font-medium tracking-wider uppercase text-gray-900 mb-4">
              Informations
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={cn(
                      'text-sm text-gray-600 hover:text-gray-900',
                      'transition-colors duration-200'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 : Contact */}
          <div>
            <h3 className="text-xs font-medium tracking-wider uppercase text-gray-900 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Mail size={16} className="mt-0.5 shrink-0" strokeWidth={1.5} />
                <a
                  href="mailto:contact@artshop.fr"
                  className="hover:text-gray-900 transition-colors"
                >
                  contact@artshop.fr
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin size={16} className="mt-0.5 shrink-0" strokeWidth={1.5} />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-xs text-gray-500">
            {currentYear} Art Shop. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}