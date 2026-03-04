import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** Rend le skeleton circulaire (avatar, icône) */
  circle?: boolean
}

/**
 * Brique de base pour les états de chargement.
 * Les skeletons pré-composés (OrderCardSkeleton, etc.)
 * vivent dans leurs composants respectifs.
 */
function Skeleton({ className, circle = false, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse bg-gray-100",
        circle ? "rounded-full" : "rounded-xl",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }