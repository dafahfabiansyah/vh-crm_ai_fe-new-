import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

interface ToastProps {
  title?: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  onClose?: () => void
  className?: string
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: AlertCircle,
}

const toastVariants = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
}

export function Toast({ title, description, type = "info", onClose, className }: ToastProps) {
  const Icon = toastIcons[type]
  
  return (
    <Alert className={cn(
      "relative mb-4 border-l-4 pl-8",
      toastVariants[type],
      className
    )}>
      <Icon className="h-4 w-4" />
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
}
