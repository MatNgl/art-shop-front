import type { OrderStatus } from './order.types'

/** Statistiques du dashboard admin */
export interface DashboardStats {
  /** Revenus total (commandes CONFIRMED+SHIPPED+DELIVERED) */
  revenue: number
  /** Nombre total de commandes */
  ordersCount: number
  /** Répartition par statut */
  ordersByStatus: Record<string, number>
  /** Commandes du jour */
  todayOrdersCount: number
  /** Nombre de clients (hors GUEST) */
  customersCount: number
  /** Nombre de produits avec stock < 5 */
  lowStockCount: number
}

/** Résumé d'une commande récente (pour le dashboard) */
export interface RecentOrderSummary {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  itemCount: number
  createdAt: string
}

/** Stats utilisateurs (retour de GET /users/stats) */
export interface UsersStats {
  total: number
  active: number
  inactive: number
  suspended: number
  byRole: Record<string, number>
  byAuthProvider: Record<string, number>
}

/** Log d'activité (retour de GET /activity-logs) */
export interface ActivityLogEntry {
  id: string
  actorType: string
  actorUserId?: string
  actorUser?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  actionType: string
  entityType: string
  entityId?: string
  severity: string
  metadata: Record<string, unknown>
  createdAt: string
}

/** Réponse paginée des logs */
export interface PaginatedActivityLogs {
  data: ActivityLogEntry[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/** Utilisateur retourné par GET /users (admin) */
export interface AdminUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  phone?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  authProvider: 'LOCAL' | 'GOOGLE'
  avatarUrl?: string
  role: {
    id: string
    code: string
    label: string
  }
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

/** Réponse paginée des utilisateurs */
export interface PaginatedUsers {
  data: AdminUser[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/** Rôle disponible */
export interface AvailableRole {
  id: string
  code: string
  label: string
}
/** Matériau retourné par l'API */
export interface MaterialResponse {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}