import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { useAddressSearch } from '@/hooks/useAddressSearch'
import type { GeocodingFeature, ParsedAddress } from '@/types/geocoding.types'

interface AddressAutocompleteProps {
  /** Callback quand l'utilisateur sélectionne une adresse */
  onSelect: (address: ParsedAddress) => void
  /** Valeur initiale affichée (pour mode édition) */
  initialValue?: string
  /** Placeholder du champ */
  placeholder?: string
}

/**
 * Champ d'autocomplétion d'adresse utilisant l'API Géoplateforme IGN.
 *
 * L'utilisateur tape une adresse, les suggestions apparaissent en dropdown.
 * En sélectionnant une suggestion, les champs line1, postalCode, city
 * sont remplis automatiquement via le callback `onSelect`.
 */
export function AddressAutocomplete({
  onSelect,
  initialValue = '',
  placeholder = 'Rechercher une adresse...',
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { suggestions, isLoading, search, clearSuggestions } =
    useAddressSearch()

  // État dérivé — pas de setState dans un useEffect
  const isOpen = isFocused && suggestions.length > 0 && !isDismissed

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Extraire les données structurées d'une feature GeoJSON
   */
  function parseFeature(feature: GeocodingFeature): ParsedAddress {
    const { housenumber, street, postcode, city } = feature.properties
    return {
      line1: housenumber && street ? `${housenumber} ${street}` : street || '',
      postalCode: postcode || '',
      city: city || '',
    }
  }

  function handleInputChange(value: string) {
    setInputValue(value)
    setIsDismissed(false)
    search(value)
  }

  function handleSelect(feature: GeocodingFeature) {
    const parsed = parseFeature(feature)
    setInputValue(feature.properties.label)
    setIsDismissed(true)
    clearSuggestions()
    onSelect(parsed)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsDismissed(true)
      clearSuggestions()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Champ de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isLoading ? (
            <Loader2 size={14} className="text-gray-400 animate-spin" />
          ) : (
            <Search size={14} className="text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            setIsDismissed(false)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
        />
      </div>

      {/* Dropdown de suggestions */}
      {isOpen && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {suggestions.map((feature) => (
            <li key={feature.properties.id}>
              <button
                type="button"
                onClick={() => handleSelect(feature)}
                className="flex items-start gap-2.5 w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <MapPin
                  size={14}
                  className="mt-0.5 text-gray-400 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {feature.properties.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {feature.properties.postcode} {feature.properties.city}
                    {feature.properties.context && (
                      <span className="text-gray-400">
                        {' '}
                        — {feature.properties.context}
                      </span>
                    )}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}