import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  UserX,
  UserCheck,
  Trash2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { AdminUser, PaginatedUsers } from '@/types'

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', className: 'bg-red-50 text-red-700 ring-red-200' },
  ADMIN: { label: 'Admin', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
  USER: { label: 'Utilisateur', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  GUEST: { label: 'Invité', className: 'bg-gray-50 text-gray-500 ring-gray-200' },
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Actif', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  INACTIVE: { label: 'Inactif', className: 'bg-gray-50 text-gray-500 ring-gray-200' },
  SUSPENDED: { label: 'Suspendu', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
}

const ROLES_FILTER = ['Tous', 'SUPER_ADMIN', 'ADMIN', 'USER', 'GUEST'] as const
const STATUS_FILTER = ['Tous', 'ACTIVE', 'INACTIVE', 'SUSPENDED'] as const

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function UsersPage() {
  const [data, setData] = useState<PaginatedUsers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Tous')
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const limit = 15

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit }
      if (search.trim()) params.search = search.trim()
      if (roleFilter !== 'Tous') params.roleCode = roleFilter
      if (statusFilter !== 'Tous') params.status = statusFilter

      const result = await adminService.getUsers(params)
      setData(result)
    } catch {
      toast.error('Impossible de charger les utilisateurs')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter, statusFilter])

  async function handleStatusChange(user: AdminUser, newStatus: string) {
    setActionLoading(user.id)
    try {
      await adminService.updateUserStatus(user.id, newStatus)
      toast.success(`Statut de ${user.email} mis à jour`)
      void fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Supprimer définitivement ${user.email} ?`)) return

    setActionLoading(user.id)
    try {
      await adminService.deleteUser(user.id)
      toast.success(`${user.email} supprimé`)
      void fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs</h1>
        <p className="mt-1 text-sm text-gray-500">
          {data ? `${data.meta.total} utilisateur${data.meta.total > 1 ? 's' : ''}` : 'Chargement...'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par email, nom..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 cursor-pointer"
        >
          {ROLES_FILTER.map((role) => (
            <option key={role} value={role}>
              {role === 'Tous' ? 'Tous les rôles' : ROLE_BADGES[role]?.label ?? role}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 cursor-pointer"
        >
          {STATUS_FILTER.map((status) => (
            <option key={status} value={status}>
              {status === 'Tous' ? 'Tous les statuts' : STATUS_BADGES[status]?.label ?? status}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <UsersTableSkeleton />
        ) : !data || data.data.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Rôle
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Inscription
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Connexion
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isActionLoading={actionLoading === user.id}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.meta.totalPages > 1 && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

interface UserRowProps {
  user: AdminUser
  isActionLoading: boolean
  onStatusChange: (user: AdminUser, status: string) => void
  onDelete: (user: AdminUser) => void
}

function UserRow({ user, isActionLoading, onStatusChange, onDelete }: UserRowProps) {
  const roleBadge = ROLE_BADGES[user.role.code] ?? ROLE_BADGES.USER
  const statusBadge = STATUS_BADGES[user.status] ?? STATUS_BADGES.ACTIVE
  const isSuperAdmin = user.role.code === 'SUPER_ADMIN'

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
              {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName || user.email}
            </p>
            {displayName && (
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            )}
            {user.authProvider === 'GOOGLE' && (
              <span className="text-[10px] text-gray-400">via Google</span>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
            roleBadge.className,
          )}
        >
          {isSuperAdmin && <ShieldAlert size={12} />}
          {user.role.code === 'ADMIN' && <Shield size={12} />}
          {roleBadge.label}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
            statusBadge.className,
          )}
        >
          {statusBadge.label}
        </span>
      </td>

      <td className="px-6 py-4 text-xs text-gray-500">
        {formatDate(user.createdAt)}
      </td>

      <td className="px-6 py-4 text-xs text-gray-500">
        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais'}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          {isActionLoading ? (
            <Loader2 size={16} className="animate-spin text-gray-400" />
          ) : (
            <>
              {user.status === 'ACTIVE' && !isSuperAdmin && (
                <button
                  onClick={() => onStatusChange(user, 'SUSPENDED')}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  title="Suspendre"
                >
                  <UserX size={15} />
                </button>
              )}

              {user.status === 'SUSPENDED' && (
                <button
                  onClick={() => onStatusChange(user, 'ACTIVE')}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  title="Réactiver"
                >
                  <UserCheck size={15} />
                </button>
              )}

              {!isSuperAdmin && (
                <button
                  onClick={() => onDelete(user)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">
        Page {page} sur {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function UsersTableSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton circle className="h-8 w-8" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}