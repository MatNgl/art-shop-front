import { useState, useEffect, useRef, useCallback } from 'react'
import type { GeocodingFeature, GeocodingResponse } from '@/types/geocoding.types'

// -------------------------------------------------------
// API Géoplateforme IGN — Service de géocodage
// Remplace l'ancienne api-adresse.data.gouv.fr (dépréciée)
// Gratuit, sans clé API, 50 req/s max
// -------------------------------------------------------
const GEOCODING_BASE_URL = 'https://data.geopf.fr/geocodage/search/'
const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 3
const MAX_RESULTS = 5

interface UseAddressSearchReturn {
  /** Suggestions retournées par l'API */
  suggestions: GeocodingFeature[]
  /** Chargement en cours */
  isLoading: boolean
  /** Erreur éventuelle */
  error: string | null
  /** Lancer une recherche (appelé à chaque frappe) */
  search: (query: string) => void
  /** Vider les suggestions (après sélection) */
  clearSuggestions: () => void
}

/**
 * Hook d'autocomplétion d'adresse via l'API Géoplateforme IGN.
 *
 * - Debounce de 300ms pour limiter les appels
 * - Minimum 3 caractères avant de lancer la recherche
 * - Filtre sur le type "housenumber" pour n'obtenir que des adresses complètes
 * - Annulation automatique des requêtes obsolètes via AbortController
 */
export function useAddressSearch(): UseAddressSearchReturn {
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  const fetchSuggestions = useCallback(async (query: string) => {
    // Annuler la requête précédente si elle est encore en cours
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: query,
        limit: String(MAX_RESULTS),
        type: 'housenumber',
      })

      const response = await fetch(`${GEOCODING_BASE_URL}?${params.toString()}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Erreur API géocodage (${response.status})`)
      }

      const data: GeocodingResponse = await response.json()
      setSuggestions(data.features)
    } catch (err) {
      // Ignorer les erreurs d'annulation (AbortError)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Erreur de recherche')
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const search = useCallback(
    (query: string) => {
      // Annuler le debounce précédent
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Ne pas chercher si la requête est trop courte
      if (query.trim().length < MIN_QUERY_LENGTH) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query)
      }, DEBOUNCE_MS)
    },
    [fetchSuggestions],
  )

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setError(null)
  }, [])

  return {
    suggestions,
    isLoading,
    error,
    search,
    clearSuggestions,
  }
}