import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import TiltedCard from '@/components/ui/TiltedCard'
import type { Product, ProductImage } from '@/types'

//  Skeleton 
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-3/4 w-full rounded-[15px] bg-gray-100" />
      <div className="space-y-2 px-1">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
      </div>
    </div>
  )
}

//  Card 
interface ProductCardProps {
  product: Product
  primaryImage?: ProductImage
  minPrice?: number
  className?: string
}

export function ProductCard({
  product,
  primaryImage,
  minPrice,
  className,
}: ProductCardProps) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  const imageUrl = primaryImage?.urls.medium ?? primaryImage?.url ?? null

  //  Contenu image (passé à TiltedCard) 
  const imageContent =  imageUrl && !imgError ? (
      <img
        src={imageUrl}
        alt={primaryImage?.altText ?? product.name}
        className="h-full w-full object-cover rounded-[15px]"
        onError={() => setImgError(true)}
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-gray-50">
        <span className="text-xs text-gray-300 uppercase tracking-widest">
          Sans image
        </span>
      </div>
    )

  //  Badge "Coup de cœur" (overlay TiltedCard) 
  const overlayBadge = product.featured ? (
    <span className="m-3 inline-block rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
      Coup de cœur
    </span>
  ) : null

  return (
    <article
      className={cn('group flex flex-col gap-3 cursor-pointer', className)}
      onClick={() => navigate(`/oeuvre/${product.slug}`)}
    >
      {/* ── Image avec effet tilt ── */}
      <div className="aspect-3/4 w-full">
        <TiltedCard
          imageSrc={imageUrl ?? ''}
          altText={primaryImage?.altText ?? product.name}
          captionText={product.name}
          containerWidth="100%"
          containerHeight="100%"
          imageWidth="100%"
          imageHeight="100%"
          rotateAmplitude={10}
          scaleOnHover={1.04}
          showMobileWarning={false}
          showTooltip={false}
          displayOverlayContent={product.featured}
          overlayContent={overlayBadge}
        >
          {/* Le contenu image est géré via imageSrc,
              mais on surcharge le rendu en cas d'erreur */}
        </TiltedCard>
      </div>

      {/*  Infos  */}
      <div className="flex flex-col gap-1 px-1">
        {product.shortDescription && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between">
          {minPrice != null ? (
            <span className="text-sm font-medium text-gray-700">
              À partir de{' '}
              <strong className="text-gray-900">
                {minPrice.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </strong>
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">Voir les prix</span>
          )}

          <span className="text-[10px] font-medium uppercase tracking-widest text-gray-300 group-hover:text-gray-500 transition-colors">
            Découvrir →
          </span>
        </div>
      </div>
    </article>
  )
}