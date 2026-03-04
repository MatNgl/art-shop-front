import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  label: string
}

interface CheckoutStepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

/**
 * Stepper visuel pour le tunnel de commande.
 * Les étapes complétées sont cliquables pour revenir en arrière.
 */
export function CheckoutStepper({
  steps,
  currentStep,
  onStepClick,
}: CheckoutStepperProps) {
  return (
    <nav aria-label="Étapes de la commande" className="w-full">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isClickable = isCompleted && onStepClick !== undefined

          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1",
              )}
            >
              {/* Cercle + label */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                className={cn(
                  "group flex flex-col items-center gap-2",
                  isClickable && "cursor-pointer",
                  !isClickable && !isCurrent && "cursor-default",
                  isCurrent && "cursor-default",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {/* Cercle numéroté */}
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                    isCompleted &&
                      "bg-gray-900 text-white group-hover:bg-gray-700",
                    isCurrent &&
                      "bg-gray-900 text-white ring-4 ring-gray-900/10",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-gray-100 text-gray-400",
                  )}
                >
                  {isCompleted ? <Check size={18} strokeWidth={2.5} /> : stepNumber}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap transition-colors",
                    isCurrent && "text-gray-900",
                    isCompleted && "text-gray-600",
                    !isCompleted && !isCurrent && "text-gray-400",
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Ligne de connexion */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-4 h-px flex-1 transition-colors duration-300",
                    isCompleted ? "bg-gray-900" : "bg-gray-200",
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function CheckoutStepperSkeleton() {
  return (
    <div className="flex items-center w-full animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className={cn("flex items-center", i < 3 && "flex-1")}>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-100" />
            <div className="h-3 w-16 rounded bg-gray-100" />
          </div>
          {i < 3 && <div className="mx-4 h-px flex-1 bg-gray-100" />}
        </div>
      ))}
    </div>
  )
}