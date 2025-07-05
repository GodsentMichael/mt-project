"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

// Emoji mapping for different toast variants
const getToastEmoji = (variant?: string) => {
  switch (variant) {
    case "destructive":
      return "❌"
    case "success":
      return "✅"
    case "warning":
      return "⚠️"
    case "info":
      return "ℹ️"
    default:
      return "💬"
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const emoji = getToastEmoji(variant ?? undefined)
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start space-x-3 flex-1">
              <div className="text-lg flex-shrink-0 mt-0.5">
                {emoji}
              </div>
              <div className="grid gap-1 flex-1 min-w-0">
                {title && (
                  <ToastTitle className="flex items-center gap-2">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
            
            {/* Auto-dismiss progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 overflow-hidden">
              <div className="h-full bg-current opacity-30 animate-[toast-progress_5s_linear_forwards]" />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
