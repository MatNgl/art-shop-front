import { useCallback, useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  XCircle,
  Flame,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { PaginatedActivityLogs, ActivityLogEntry } from '@/types'

const SEVERITY_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  INFO: { label: 'Info', icon: Info, className: 'bg-blue-50 text-blue-600 ring-blue-200' },
  WARNING: { label: 'Warning', icon: AlertTriangle, className: 'bg-amber-50 text-amber-600 ring-amber-200' },
  ERROR: { label: 'Erreur', icon: XCircle, className: 'bg-red-50 text-red-600 ring-red-200' },
  CRITICAL: { label: 'Critique', icon: Flame, className: 'bg-red-100 text-red-800 ring-red-300' },
}

const ACTOR_BADGES: Record<string, { label: string; className: string }> = {
  USER: { label: 'User', className: 'bg-blue-50 text-blue-700' },
  GUEST: { label: 'Guest', className: 'bg-gray-50 text-gray-500' },
  ADMIN: { label: 'Admin', className: 'bg-violet-50 text-violet-700' },
  SUPERADMIN: { label: 'Super', className: 'bg-red-50 text-red-700' },
  SYSTEM: { label: 'Système', className: 'bg-emerald-50 text-emerald-700' },
}

const ENTITY_TYPES = [
  'Tous', 'USER', 'ORDER', 'CART', 'CART_ITEM', 'PRODUCT', 'PRODUCT_VARIANT',
  'PRODUCT_IMAGE', 'PRODUCT_VARIANT_IMAGE', 'CATEGORY', 'SUBCATEGORY',
  'FORMAT', 'MATERIAL', 'TAG', 'ADDRESS', 'PAYMENT', 'SHIPMENT',
] as const

const SEVERITY_FILTER = ['Tous', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function LogsPage() {
  const [data, setData] = useState<PaginatedActivityLogs | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState('Tous')
  const [severityFilter, setSeverityFilter] = useState('Tous')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const limit = 20

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit }
      if (entityFilter !== 'Tous') params.entityType = entityFilter
      if (severityFilter !== 'Tous') params.severity = severityFilter

      const result = await adminService.getActivityLogs(params)
      setData(result)
    } catch {
      toast.error('Impossible de charger les logs')
    } finally {
      setIsLoading(false)
    }
  }, [page, entityFilter, severityFilter])

  useEffect(() => {
    void fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    setPage(1)
  }, [entityFilter, severityFilter])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Logs d'activité</h1>
        <p className="mt-1 text-sm text-gray-500">
          {data ? `${data.meta.total} entrée${data.meta.total > 1 ? 's' : ''}` : 'Chargement...'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 cursor-pointer"
        >
          {ENTITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === 'Tous' ? 'Toutes les entités' : type}
            </option>
          ))}
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 cursor-pointer"
        >
          {SEVERITY_FILTER.map((sev) => (
            <option key={sev} value={sev}>
              {sev === 'Tous' ? 'Toutes les sévérités' : SEVERITY_CONFIG[sev]?.label ?? sev}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <LogsTableSkeleton />
        ) : !data || data.data.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Aucun log trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Sévérité
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Action
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Entité
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Acteur
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  isExpanded={expandedId === log.id}
                  onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
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

interface LogRowProps {
  log: ActivityLogEntry
  isExpanded: boolean
  onToggle: () => void
}

function LogRow({ log, isExpanded, onToggle }: LogRowProps) {
  const severity = SEVERITY_CONFIG[log.severity] ?? SEVERITY_CONFIG.INFO
  const SevIcon = severity.icon
  const actor = ACTOR_BADGES[log.actorType] ?? ACTOR_BADGES.SYSTEM
  const actorLabel = log.actorUser
    ? log.actorUser.email
    : actor.label

  const hasMetadata = Object.keys(log.metadata).length > 0

  return (
    <>
      <tr
        onClick={hasMetadata ? onToggle : undefined}
        className={cn(
          'border-b border-gray-50 last:border-0 transition-colors',
          hasMetadata && 'cursor-pointer hover:bg-gray-50/50',
        )}
      >
        <td className="px-6 py-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
              severity.className,
            )}
          >
            <SevIcon size={12} />
            {severity.label}
          </span>
        </td>

        <td className="px-6 py-3">
          <p className="text-sm font-medium text-gray-900">
            {formatAction(log.actionType)}
          </p>
        </td>

        <td className="px-6 py-3">
          <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600">
            {log.entityType}
          </span>
          {log.entityId && (
            <span className="ml-1.5 text-[10px] text-gray-400 font-mono">
              {log.entityId.slice(0, 8)}…
            </span>
          )}
        </td>

        <td className="px-6 py-3">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
              actor.className,
            )}
          >
            {actorLabel}
          </span>
        </td>

        <td className="px-6 py-3 text-right text-xs text-gray-500">
          {formatDate(log.createdAt)}
        </td>
      </tr>

      {isExpanded && hasMetadata && (
        <tr>
          <td colSpan={5} className="bg-gray-50 px-6 py-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
              Métadonnées
            </p>
            <pre className="max-h-48 overflow-auto rounded-xl bg-white border border-gray-200 p-4 text-xs text-gray-700 font-mono leading-relaxed">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
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

function LogsTableSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-24 rounded-lg" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="ml-auto h-3 w-28" />
        </div>
      ))}
    </div>
  )
}