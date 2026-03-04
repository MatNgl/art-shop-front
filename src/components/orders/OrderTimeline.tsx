import {
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { OrderStatus } from "@/types"
import type { OrderStatusHistoryEntry } from "@/types"

interface OrderTimelineProps {
  history: OrderStatusHistoryEntry[]
}

/** Icône et couleur par statut */
const TIMELINE_CONFIG: Record<
  OrderStatus,
  {
    icon: React.ElementType
    label: string
    dotClass: string
    lineClass: string
  }
> = {
  [OrderStatus.PENDING]: {
    icon: Clock,
    label: "Commande créée",
    dotClass: "bg-amber-500 text-white",
    lineClass: "bg-amber-200",
  },
  [OrderStatus.CONFIRMED]: {
    icon: CheckCircle2,
    label: "Paiement confirmé",
    dotClass: "bg-blue-500 text-white",
    lineClass: "bg-blue-200",
  },
  [OrderStatus.SHIPPED]: {
    icon: Truck,
    label: "Expédiée",
    dotClass: "bg-indigo-500 text-white",
    lineClass: "bg-indigo-200",
  },
  [OrderStatus.DELIVERED]: {
    icon: PackageCheck,
    label: "Livrée",
    dotClass: "bg-emerald-500 text-white",
    lineClass: "bg-emerald-200",
  },
  [OrderStatus.CANCELLED]: {
    icon: XCircle,
    label: "Annulée",
    dotClass: "bg-gray-400 text-white",
    lineClass: "bg-gray-200",
  },
}

/** Formate une date ISO en format lisible français */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Timeline verticale de l'historique des statuts d'une commande.
 * Affiche chaque changement avec icône, label et date.
 */
export function OrderTimeline({ history }: OrderTimelineProps) {
  // Filtrer les doublons (l'historique initial a oldStatus === newStatus)
  const entries = history.filter(
    (entry, index) => index === 0 || entry.oldStatus !== entry.newStatus,
  )

  return (
    <div className="relative space-y-0">
      {entries.map((entry, index) => {
        const config = TIMELINE_CONFIG[entry.newStatus]
        const Icon = config.icon
        const isLast = index === entries.length - 1

        return (
          <div key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Ligne verticale */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[15px] top-8 bottom-0 w-0.5",
                  config.lineClass,
                )}
              />
            )}

            {/* Point / icône */}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                config.dotClass,
              )}
            >
              <Icon size={16} />
            </div>

            {/* Contenu */}
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">
                {config.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {formatDate(entry.createdAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function OrderTimelineSkeleton() {
  return (
    <div className="space-y-0 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative flex gap-4 pb-8 last:pb-0">
          {i < 3 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-100" />
          )}
          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100" />
          <div className="flex-1 space-y-1.5 pt-0.5">
            <div className="h-4 w-32 rounded bg-gray-100" />
            <div className="h-3 w-44 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}