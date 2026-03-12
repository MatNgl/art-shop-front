import { useEffect, useRef, useState } from 'react'
import { XIcon } from '@/components/ui/x'
import { cn } from '@/lib/utils'

type ModalVariant = 'danger' | 'warning' | 'default'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ModalVariant
  onConfirm: (value?: string) => void
  onCancel: () => void
  input?: {
    label?: string
    placeholder?: string
    defaultValue?: string
    type?: 'text' | 'number'
    min?: number
  }
}

const VARIANT_STYLES: Record<ModalVariant, { button: string }> = {
  danger: {
    button: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-300',
  },
  warning: {
    button: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-300',
  },
  default: {
    button: 'bg-gray-900 hover:bg-gray-800 focus-visible:ring-gray-300',
  },
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  onConfirm,
  onCancel,
  input,
}: ConfirmModalProps) {
  // La key sur le composant interne force le remontage à chaque ouverture,
  // ce qui réinitialise le state sans useEffect
  if (!open) return null

  return (
    <ConfirmModalInner
      key={title + (input?.defaultValue ?? '')}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant}
      onConfirm={onConfirm}
      onCancel={onCancel}
      input={input}
    />
  )
}

interface ConfirmModalInnerProps {
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  variant: ModalVariant
  onConfirm: (value?: string) => void
  onCancel: () => void
  input?: {
    label?: string
    placeholder?: string
    defaultValue?: string
    type?: 'text' | 'number'
    min?: number
  }
}

function ConfirmModalInner({
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant,
  onConfirm,
  onCancel,
  input,
}: ConfirmModalInnerProps) {
  // Initialisé une seule fois au montage grâce à la key du parent
  const [inputValue, setInputValue] = useState(input?.defaultValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Focus l'input au montage
  useEffect(() => {
    if (input) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [])

  // Fermer avec Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  function handleConfirm() {
    if (input) {
      onConfirm(inputValue)
    } else {
      onConfirm()
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      onCancel()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    }
  }

  const styles = VARIANT_STYLES[variant]

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 pr-8">{title}</h3>
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 mb-5">{description}</p>
        )}

        {/* Champ de saisie optionnel */}
        {input && (
          <div className="mb-5">
            {input.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {input.label}
              </label>
            )}
            <input
              ref={inputRef}
              type={input.type ?? 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={input.placeholder}
              min={input.min}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              'rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2',
              styles.button,
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}