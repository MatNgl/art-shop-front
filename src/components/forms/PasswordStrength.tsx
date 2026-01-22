import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '', textColor: '' }

    let score = 0

    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 1) return { score: 1, label: 'Faible', color: 'bg-red-400', textColor: 'text-red-600' }
    if (score <= 2) return { score: 2, label: 'Moyen', color: 'bg-orange-400', textColor: 'text-orange-600' }
    if (score <= 3) return { score: 3, label: 'Bon', color: 'bg-yellow-400', textColor: 'text-yellow-600' }
    if (score <= 4) return { score: 4, label: 'Fort', color: 'bg-green-400', textColor: 'text-green-600' }
    return { score: 5, label: 'Excellent', color: 'bg-emerald-400', textColor: 'text-emerald-600' }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              level <= strength.score ? strength.color : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', strength.textColor)}>
        Force du mot de passe : {strength.label}
      </p>
    </div>
  )
}