import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import * as adminService from '@/services/admin.service'
import type { ProductResponse } from '@/types'

import { ProductGeneralTab } from '@/components/admin/products/ProductGeneralTab'
import { ProductVariantsTab } from '@/components/admin/products/ProductVariantsTab'

type TabType = 'GENERAL' | 'VARIANTS' | 'IMAGES'

export function ProductEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'nouveau'

  const [activeTab, setActiveTab] = useState<TabType>('GENERAL')
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)

  const fetchProduct = useCallback(async () => {
    if (isNew) return
    setIsLoading(true)
    try {
      const data = await adminService.getProductById(id)
      setProduct(data)
    } catch {
      toast.error('Impossible de charger le produit')
      navigate('/admin/produits')
    } finally {
      setIsLoading(false)
    }
  }, [id, isNew, navigate])

  useEffect(() => {
    void fetchProduct()
  }, [fetchProduct])

  // Callbacks pour rafraîchir les données depuis les onglets
  const handleProductUpdated = (updatedProduct: ProductResponse) => {
    setProduct(updatedProduct)
    if (isNew) {
      navigate(`/admin/produits/${updatedProduct.id}`, { replace: true })
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* En-tête de navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/produits')}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? 'Créer un nouveau produit' : product?.name ?? 'Chargement...'}
          </h1>
          {!isNew && product && (
            <p className="mt-1 text-sm text-gray-500">/{product.slug}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Menu des Onglets (Masqué si on est en train de créer) */}
          {!isNew && (
            <div className="flex items-center gap-6 border-b border-gray-200">
              <TabButton 
                active={activeTab === 'GENERAL'} 
                onClick={() => setActiveTab('GENERAL')}
                label="Général & SEO" 
              />
              <TabButton 
                active={activeTab === 'VARIANTS'} 
                onClick={() => setActiveTab('VARIANTS')}
                label="Déclinaisons & Stocks" 
              />
              <TabButton 
                active={activeTab === 'IMAGES'} 
                onClick={() => setActiveTab('IMAGES')}
                label="Images" 
              />
            </div>
          )}

          {/* Contenu de l'onglet actif */}
          {activeTab === 'GENERAL' && (
            <ProductGeneralTab product={product} onSaved={handleProductUpdated} />
          )}
          {activeTab === 'VARIANTS' && !isNew && product && (
            <ProductVariantsTab product={product} />
          )}
          {activeTab === 'IMAGES' && !isNew && product && (
            <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              L'interface des images arrive à la prochaine étape !
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'pb-4 text-sm font-medium transition-colors border-b-2 relative top-[1px]',
        active 
          ? 'border-gray-900 text-gray-900' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      )}
    >
      {label}
    </button>
  )
}