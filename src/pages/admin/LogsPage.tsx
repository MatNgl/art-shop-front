import { useCallback, useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  XCircle,
  Flame,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import * as adminService from '@/services/admin.service'
import type { PaginatedActivityLogs, ActivityLogEntry } from '@/types'

const SEVERITY_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  INFO: { label: 'Info', icon: Info, className: 'bg-blue-50 text-blue-600 ring-blue-200' },
  WARNING: { label: 'Avertissement', icon: AlertTriangle, className: 'bg-amber-50 text-amber-600 ring-amber-200' },
  ERROR: { label: 'Erreur', icon: XCircle, className: 'bg-red-50 text-red-600 ring-red-200' },
  CRITICAL: { label: 'Critique', icon: Flame, className: 'bg-red-100 text-red-800 ring-red-300' },
}

const ACTOR_BADGES: Record<string, { label: string; className: string }> = {
  USER: { label: 'Client', className: 'bg-blue-50 text-blue-700' },
  GUEST: { label: 'Visiteur', className: 'bg-gray-50 text-gray-500' },
  ADMIN: { label: 'Admin', className: 'bg-violet-50 text-violet-700' },
  SUPERADMIN: { label: 'SuperAdmin', className: 'bg-red-50 text-red-700' },
  SYSTEM: { label: 'Système', className: 'bg-emerald-50 text-emerald-700' },
}

// --- Dictionnaires de traduction ---
const ENTITY_TRANSLATIONS: Record<string, string> = {
  USER: 'Utilisateur',
  ORDER: 'Commande',
  CART: 'Panier',
  CART_ITEM: 'Article du panier',
  PRODUCT: 'Produit',
  PRODUCT_VARIANT: 'Variante produit',
  PRODUCT_IMAGE: 'Image produit',
  PRODUCT_VARIANT_IMAGE: 'Image variante',
  CATEGORY: 'Catégorie',
  SUBCATEGORY: 'Sous-catégorie',
  FORMAT: 'Format',
  MATERIAL: 'Matériau',
  TAG: 'Étiquette',
  ADDRESS: 'Adresse',
  PAYMENT: 'Paiement',
  SHIPMENT: 'Expédition',
  PROMOTION: 'Promotion',
  SYSTEM: 'Système',
}

const ACTION_TRANSLATIONS: Record<string, string> = {
  // Auth
  USER_REGISTERED: 'Utilisateur inscrit',
  USER_LOGIN: 'Utilisateur connecté',
  USER_LOGIN_FAILED: 'Échec de connexion utilisateur',
  USER_LOGOUT: 'Utilisateur déconnecté',
  GOOGLE_AUTH_SUCCESS: 'Connexion Google réussie',
  PASSWORD_RESET_REQUESTED: 'Réinitialisation de mot de passe demandée',
  PASSWORD_RESET_COMPLETED: 'Réinitialisation de mot de passe complétée',

  // Gestion des utilisateurs
  USER_UPDATED: 'Utilisateur mis à jour',
  USER_STATUS_CHANGED: 'Statut utilisateur modifié',
  USER_DELETED: 'Utilisateur supprimé',
  GUEST_USER_CREATED: 'Utilisateur invité créé',

  // Gestion des tags
  TAG_CREATED: 'Tag créé',
  TAG_UPDATED: 'Tag mis à jour',
  TAG_DELETED: 'Tag supprimé',

  // Gestion des formats
  FORMAT_CREATED: 'Format créé',
  FORMAT_UPDATED: 'Format mis à jour',
  FORMAT_DELETED: 'Format supprimé',

  // Gestion des matériaux
  MATERIAL_CREATED: 'Matériau créé',
  MATERIAL_UPDATED: 'Matériau mis à jour',
  MATERIAL_DELETED: 'Matériau supprimé',

  // Gestion des produits
  PRODUCT_CREATED: 'Produit créé',
  PRODUCT_UPDATED: 'Produit mis à jour',
  PRODUCT_DELETED: 'Produit supprimé',
  PRODUCT_ARCHIVED: 'Produit archivé',

  // Product Variants
  PRODUCT_VARIANT_CREATED: 'Variante produit créée',
  PRODUCT_VARIANT_UPDATED: 'Variante produit mise à jour',
  PRODUCT_VARIANT_DELETED: 'Variante produit supprimée',
  PRODUCT_VARIANT_STOCK_UPDATED: 'Stock variante produit mis à jour',
  PRODUCT_VARIANT_ARCHIVED: 'Variante produit archivée',

  // Gestion des images produits
  PRODUCT_IMAGE_UPLOADED: 'Image produit téléchargée',
  PRODUCT_IMAGE_UPDATED: 'Image produit mise à jour',
  PRODUCT_IMAGE_DELETED: 'Image produit supprimée',
  PRODUCT_IMAGE_SET_PRIMARY: 'Image produit définie comme principale',

  // Gestion des images variantes
  PRODUCT_VARIANT_IMAGE_UPLOADED: 'Image variante téléchargée',
  PRODUCT_VARIANT_IMAGE_UPDATED: 'Image variante mise à jour',
  PRODUCT_VARIANT_IMAGE_DELETED: 'Image variante supprimée',
  PRODUCT_VARIANT_IMAGE_SET_PRIMARY: 'Image variante définie comme principale',

  // Catégories & sous-catégories
  CATEGORY_CREATED: 'Catégorie créée',
  CATEGORY_UPDATED: 'Catégorie mise à jour',
  CATEGORY_DELETED: 'Catégorie supprimée',
  SUBCATEGORY_CREATED: 'Sous-catégorie créée',
  SUBCATEGORY_UPDATED: 'Sous-catégorie mise à jour',
  SUBCATEGORY_DELETED: 'Sous-catégorie supprimée',

  // Panier
  CART_CREATED: 'Panier créé',
  CART_ITEM_ADDED: 'Article ajouté au panier',
  CART_ITEM_UPDATED: 'Article du panier mis à jour',
  CART_ITEM_REMOVED: 'Article retiré du panier',
  CART_CLEARED: 'Panier vidé',

  // Address
  ADDRESS_CREATED: 'Adresse créée',
  ADDRESS_UPDATED: 'Adresse mise à jour',
  ADDRESS_SET_DEFAULT: 'Adresse définie par défaut',
  ADDRESS_DELETED: 'Adresse supprimée',

  // Orders
  ORDER_CREATED: 'Commande créée',
  ORDER_STATUS_CHANGED: 'Statut de commande modifié',
  ORDER_CANCELLED: 'Commande annulée',

  // Paiement
  PAYMENT_INITIATED: 'Paiement initié',
  PAYMENT_SUCCESS: 'Paiement réussi',
  PAYMENT_FAILED: 'Échec du paiement',
  PAYMENT_REFUNDED: 'Paiement remboursé',
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
  // Utilisation du dictionnaire strict basé sur ton enum ActionType
  return ACTION_TRANSLATIONS[action] || action
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
              {type === 'Tous' ? 'Toutes les entités' : ENTITY_TRANSLATIONS[type] || type}
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

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
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
                <th className="w-10 pl-4 pr-2 py-3"></th>
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
  const translatedEntity = ENTITY_TRANSLATIONS[log.entityType] || log.entityType

  return (
    <>
      <tr
        onClick={hasMetadata ? onToggle : undefined}
        className={cn(
          'border-b border-gray-50 last:border-0 transition-colors',
          hasMetadata && 'cursor-pointer hover:bg-gray-50',
          isExpanded && 'bg-gray-50/80'
        )}
      >
        <td className="pl-4 pr-2 py-3 w-10 text-center">
          {hasMetadata && (
            <button className="text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center w-full">
              <ChevronDown
                size={16}
                className={cn(
                  'transition-transform duration-200',
                  isExpanded ? 'rotate-180 text-gray-900' : ''
                )}
              />
            </button>
          )}
        </td>

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
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
            {translatedEntity}
          </span>
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

        <td className="px-6 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
          {formatDate(log.createdAt)}
        </td>
      </tr>

      {isExpanded && hasMetadata && (
        <tr>
          <td colSpan={6} className="bg-gray-50/80 px-12 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Détails des métadonnées
              </span>
            </div>
            <MetadataViewer metadata={log.metadata} />
          </td>
        </tr>
      )}
    </>
  )
}

interface MetadataViewerProps {
  metadata?: Record<string, unknown> | null
}

function MetadataViewer({ metadata }: MetadataViewerProps) {
  if (!metadata || typeof metadata !== 'object') {
    return null
  }

  // Détecte si la structure correspond à une mise à jour (oldValues / newValues)
  const isDiffFormat = 'oldValues' in metadata || 'newValues' in metadata

  if (isDiffFormat) {
    // Cast typé sécurisé
    const typedMetadata = metadata as {
      oldValues?: Record<string, unknown>
      newValues?: Record<string, unknown>
    }

    const oldVals = typedMetadata.oldValues || {}
    const newVals = typedMetadata.newValues || {}
    const allKeys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]))

    return (
      <div className="rounded-xl border border-gray-200/60 bg-gray-900 p-4 shadow-inner">
        <div className="space-y-3 font-mono text-xs">
          {allKeys.map((key) => {
            const oldValStr = JSON.stringify(oldVals[key] ?? null)
            const newValStr = JSON.stringify(newVals[key] ?? null)
            const isChanged = oldValStr !== newValStr

            return (
              <div key={key} className="flex items-start gap-4">
                <span className="w-32 text-gray-500 shrink-0 mt-0.5">{key}</span>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {isChanged ? (
                    <>
                      {/* Ancienne valeur (barrée, rouge) */}
                      {oldVals[key] !== undefined && (
                        <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded line-through decoration-red-400/50">
                          {oldValStr}
                        </span>
                      )}
                      
                      <ArrowRight size={12} className="text-gray-500" />
                      
                      {/* Nouvelle valeur (verte) */}
                      {newVals[key] !== undefined && (
                        <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                          {newValStr}
                        </span>
                      )}
                    </>
                  ) : (
                    /* Valeur inchangée (grise) */
                    <span className="text-gray-400 px-1.5 py-0.5">{oldValStr}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Fallback classique si ce n'est pas un format oldValues/newValues
  return (
    <div className="rounded-xl border border-gray-200/60 bg-gray-900 overflow-hidden shadow-inner">
      <pre className="max-h-64 overflow-auto p-4 text-[13px] text-gray-300 font-mono leading-relaxed">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </div>
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
          <Skeleton className="h-5 w-8 rounded-full" />
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