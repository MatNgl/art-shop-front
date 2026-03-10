import { get, post, patch, del } from './api'
import type {
  DashboardStats,
  RecentOrderSummary,
  UsersStats,
  PaginatedActivityLogs,
  PaginatedUsers,
  AdminUser,
  AvailableRole,
  MaterialResponse,
} from '@/types'

//  Stats utilisateurs 

export function getUsersStats(): Promise<UsersStats> {
  return get<UsersStats>('/users/stats')
}

//  Commandes admin 

export function getAllOrders(): Promise<RecentOrderSummary[]> {
  return get<RecentOrderSummary[]>('/orders/admin/all')
}

//  Logs d'activité 

export function getActivityLogs(
  params?: Record<string, string | number>,
): Promise<PaginatedActivityLogs> {
  const query = params
    ? '?' + new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString()
    : ''
  return get<PaginatedActivityLogs>(`/activity-logs${query}`)
}

// Dashboard agrégé 

/**
 * Agrège les données de plusieurs endpoints pour construire
 * les stats du dashboard admin.
 *
 * Côté backend, il n'y a pas d'endpoint dédié `/admin/dashboard` :
 * on compose les données côté client à partir des endpoints existants.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, usersStats] = await Promise.all([
    getAllOrders(),
    getUsersStats(),
  ])

  // Revenus = somme des commandes payées (CONFIRMED + SHIPPED + DELIVERED)
  const paidStatuses = new Set(['CONFIRMED', 'SHIPPED', 'DELIVERED'])
  const paidOrders = orders.filter((o) => paidStatuses.has(o.status))
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0)

  // Répartition par statut
  const ordersByStatus: Record<string, number> = {}
  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1
  }

  // Commandes du jour
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayOrdersCount = orders.filter(
    (o) => o.createdAt.slice(0, 10) === todayStr,
  ).length

  // Clients = total users - guests
  const guestCount = usersStats.byRole['GUEST'] ?? 0
  const customersCount = usersStats.total - guestCount

  return {
    revenue,
    ordersCount: orders.length,
    ordersByStatus,
    todayOrdersCount,
    customersCount,
    lowStockCount: 0, // nécessiterait un endpoint dédié — V2
  }
}

// ── Utilisateurs admin ──────────────────────────

export function getUsers(
  params?: Record<string, string | number>,
): Promise<PaginatedUsers> {
  const query = params
    ? '?' + new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString()
    : ''
  return get<PaginatedUsers>(`/users${query}`)
}

export function getUserById(id: string): Promise<AdminUser> {
  return get<AdminUser>(`/users/${id}`)
}

export function getAvailableRoles(): Promise<AvailableRole[]> {
  return get<AvailableRole[]>('/users/roles')
}

export function updateUser(
  id: string,
  data: Record<string, unknown>,
): Promise<AdminUser> {
  return patch<AdminUser>(`/users/${id}`, data)
}

export function updateUserStatus(
  id: string,
  status: string,
  reason?: string,
): Promise<AdminUser> {
  return patch<AdminUser>(`/users/${id}/status`, { status, reason })
}

export function deleteUser(id: string): Promise<void> {
  return del<void>(`/users/${id}`)
}

// ── Matériaux admin ─────────────────────────────

interface MaterialPayload {
  name: string
  description?: string
  isActive?: boolean
}

export function getMaterials(): Promise<MaterialResponse[]> {
  return get<MaterialResponse[]>('/materials')
}

export function createMaterial(data: MaterialPayload): Promise<MaterialResponse> {
  return post<MaterialResponse>('/materials', data)
}

export function updateMaterial(id: string, data: Partial<MaterialPayload>): Promise<MaterialResponse> {
  return patch<MaterialResponse>(`/materials/${id}`, data)
}

export function deleteMaterial(id: string): Promise<void> {
  return del<void>(`/materials/${id}`)
}