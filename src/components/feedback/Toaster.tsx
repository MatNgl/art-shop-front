import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '9999px',
          padding: '12px 20px',
        },
        classNames: {
          toast: 'bg-white/90 backdrop-blur-md border border-white/20 shadow-lg',
          title: 'text-gray-900 font-medium',
          description: 'text-gray-600',
          success: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
          error: 'bg-red-50/90 border-red-200 text-red-900',
        },
      }}
    />
  )
}