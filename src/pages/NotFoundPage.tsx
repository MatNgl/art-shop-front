// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6">
      <span className="text-6xl font-light text-gray-200">404</span>
      <p className="text-lg font-medium text-gray-400">
        Cette page n'existe pas
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à l'accueil
      </Link>
    </main>
  )
}