import { forwardRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Lock } from 'lucide-react'

interface FormPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormPassword = forwardRef<HTMLInputElement, FormPasswordProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || props.name

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </Label>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </div>

          <Input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'h-12 bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400',
              'rounded-xl',
              'focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200',
              'transition-all duration-200',
              'pl-10 pr-12',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
              className
            )}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

FormPassword.displayName = 'FormPassword'