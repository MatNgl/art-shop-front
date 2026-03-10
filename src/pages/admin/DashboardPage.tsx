import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  CalendarDays,
  Users,
  ArrowRight,
} from 'lucide-react'
import { OrderStatusBadge } from '@/components/orders'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { DashboardStats, RecentOrderSummary } from '@/types'
import { OrderStatus } from '@/types'

function formatPrice(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardStats, orders] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAllOrders(),
        ])
        setStats(dashboardStats)
        setRecentOrders(orders.slice(0, 5))
      } catch {
        setError('Impossible de charger les statistiques')
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de votre boutique</p>
      </div>

      {isLoading ? <StatCardsSkeleton /> : stats && <StatCards stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Commandes récentes</h2>
              <Link
                to="/admin/commandes"
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Tout voir <ArrowRight size={14} />
              </Link>
            </div>
            {isLoading ? (
              <RecentOrdersSkeleton />
            ) : recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">
                Aucune commande pour le moment
              </div>
            ) : (
              <RecentOrdersTable orders={recentOrders} />
            )}
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Répartition par statut</h2>
            {isLoading ? (
              <StatusBreakdownSkeleton />
            ) : stats ? (
              <StatusBreakdown
                ordersByStatus={stats.ordersByStatus}
                total={stats.ordersCount}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardsProps {
  stats: DashboardStats
}

function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      label: 'Revenus',
      value: formatPrice(stats.revenue),
      icon: TrendingUp,
      accent: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Commandes',
      value: String(stats.ordersCount),
      icon: ShoppingBag,
      accent: 'bg-blue-50 text-blue-600',
    },
    {
      label: "Aujourd'hui",
      value: String(stats.todayOrdersCount),
      icon: CalendarDays,
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Clients',
      value: String(stats.customersCount),
      icon: Users,
      accent: 'bg-violet-50 text-violet-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                {card.label}
              </span>
              <div className={`rounded-xl p-2 ${card.accent}`}>
                <Icon size={16} strokeWidth={1.5} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  )
}

interface RecentOrdersTableProps {
  orders: RecentOrderSummary[]
}

function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100 text-left">
          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
            Commande
          </th>
          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
            Statut
          </th>
          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">
            Total
          </th>
          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">
            Date
          </th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr
            key={order.id}
            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
          >
            <td className="px-6 py-4">
              <Link
                to={`/admin/commandes/${order.id}`}
                className="text-sm font-medium text-gray-900 hover:underline underline-offset-2"
              >
                {order.orderNumber}
              </Link>
              <p className="mt-0.5 text-xs text-gray-400">
                {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
              </p>
            </td>
            <td className="px-6 py-4">
              <OrderStatusBadge status={order.status as OrderStatus} />
            </td>
            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
              {formatPrice(order.total)}
            </td>
            <td className="px-6 py-4 text-right text-xs text-gray-500">
              {formatDate(order.createdAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function RecentOrdersSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

interface StatusBreakdownProps {
  ordersByStatus: Record<string, number>
  total: number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-amber-400' },
  CONFIRMED: { label: 'Confirmées', color: 'bg-blue-400' },
  SHIPPED: { label: 'Expédiées', color: 'bg-indigo-400' },
  DELIVERED: { label: 'Livrées', color: 'bg-emerald-400' },
  CANCELLED: { label: 'Annulées', color: 'bg-gray-300' },
}

function StatusBreakdown({ ordersByStatus, total }: StatusBreakdownProps) {
  if (total === 0) {
    return <p className="text-sm text-gray-400">Aucune donnée</p>
  }

  return (
    <div className="space-y-3">
      {Object.entries(STATUS_LABELS).map(([status, config]) => {
        const count = ordersByStatus[status] ?? 0
        const percent = total > 0 ? Math.round((count / total) * 100) : 0

        return (
          <div key={status}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">{config.label}</span>
              <span className="text-xs font-medium text-gray-900">
                {count} ({percent}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${config.color}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatusBreakdownSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}