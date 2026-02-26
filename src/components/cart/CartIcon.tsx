import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'

export function CartIcon() {
  const { itemCount } = useCart()

  return (
    <Link
      to="/panier"
      className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
      aria-label={`Panier (${itemCount} article${itemCount > 1 ? 's' : ''})`}
    >
      <ShoppingBag size={20} strokeWidth={1.5} />

      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-medium text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  )
}