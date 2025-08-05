import { Toast } from "./toast"
import { useToast } from "@/contexts/ToastContext"

export function ToastContainer() {
  const { toast, hideToast } = useToast()

  if (!toast?.show) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Toast
        type={toast.type}
        title={toast.title}
        description={toast.description}
        onClose={hideToast}
        className="shadow-lg animate-in slide-in-from-left-full duration-300"
      />
    </div>
  )
}
