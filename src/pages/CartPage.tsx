import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartItemRow } from '@/components/cart/CartItemRow'

export default function CartPage() {
  const { cart, itemCount, total, clearCart, isLoading } = useCart()

  
  // Panier vide
  
  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen pt-28 pb-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
            <ShoppingBag size={28} className="text-gray-300" />
          </div>
          <h1 className="text-xl font-medium text-gray-900 mb-2">
            Votre panier est vide
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Explorez la galerie pour découvrir des œuvres qui vous inspirent.
          </p>
          <Link
            to="/galerie"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Découvrir la galerie
          </Link>
        </div>
      </main>
    )
  }

  
  // Panier avec articles
  
  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Panier</h1>
            <p className="mt-1 text-sm text-gray-500">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={clearCart}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
          >
            <Trash2 size={13} />
            Tout supprimer
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 px-6">
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Retour galerie */}
            <Link
              to="/galerie"
              className="inline-flex items-center gap-2 mt-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Continuer mes achats
            </Link>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Récapitulatif
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="text-gray-400">Calculée à l'étape suivante</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-medium text-gray-900">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <button
                className="mt-6 w-full py-3.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Procéder au paiement
              </button>

              <p className="mt-4 text-center text-[11px] text-gray-400">
                Paiement sécurisé par Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}