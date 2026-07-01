"use client"

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastClose
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        let Icon = null

        // Determine icon based on variant
        switch (variant) {
          case "success":
            Icon = <CheckCircle2 className="h-5 w-5 text-green-600" />
            break
          case "error":
          case "destructive":
            Icon = <AlertCircle className="h-5 w-5 text-red-600" />
            break
          case "warning":
            Icon = <AlertTriangle className="h-5 w-5 text-yellow-600" />
            break
          case "loading":
            Icon = <Loader2 className="h-5 w-5 animate-spin text-primary" />
            break
          default:
            // Optional: Default icon or no icon
            // Icon = <Info className="h-5 w-5 text-blue-600" /> 
            break
        }

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3">
              {Icon && <div className="flex-shrink-0 mt-0.5">{Icon}</div>}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
