import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
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
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <Input
            ref={ref}
            id={inputId}
            className={cn(
              'h-12 bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400',
              'rounded-xl',
              'focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'