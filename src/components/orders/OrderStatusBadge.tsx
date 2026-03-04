import { cn } from "@/lib/utils"
import { OrderStatus } from "@/types"

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

/** Configuration visuelle par statut */
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  [OrderStatus.PENDING]: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  [OrderStatus.CONFIRMED]: {
    label: "Confirmée",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  [OrderStatus.SHIPPED]: {
    label: "Expédiée",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  [OrderStatus.DELIVERED]: {
    label: "Livrée",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  [OrderStatus.CANCELLED]: {
    label: "Annulée",
    className: "bg-gray-50 text-gray-500 ring-gray-200",
  },
}

/**
 * Badge coloré affichant le statut d'une commande.
 * Utilisé dans la liste des commandes et le détail.
 */
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}