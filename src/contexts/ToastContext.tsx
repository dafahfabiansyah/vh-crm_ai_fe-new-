import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export interface ToastData {
  show: boolean
  type: "success" | "error" | "warning" | "info"
  title: string
  description: string
  duration?: number
}

interface ToastContextType {
  toast: ToastData | null
  showToast: (type: "success" | "error" | "warning" | "info", title: string, description: string, duration?: number) => void
  hideToast: () => void
  success: (title: string, description?: string, duration?: number) => void
  error: (title: string, description?: string, duration?: number) => void
  warning: (title: string, description?: string, duration?: number) => void
  info: (title: string, description?: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastData | null>(null)

  const showToast = useCallback((
    type: "success" | "error" | "warning" | "info",
    title: string,
    description: string = "",
    duration: number = 5000
  ) => {
    setToast({
      show: true,
      type,
      title,
      description,
      duration
    })
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  // Auto-close toast
  useEffect(() => {
    if (toast?.show && toast.duration) {
      const timer = setTimeout(() => {
        hideToast()
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast?.show, toast?.duration, hideToast])

  // Helper methods
  const success = useCallback((title: string, description: string = "", duration?: number) => 
    showToast("success", title, description, duration), [showToast])
  
  const error = useCallback((title: string, description: string = "", duration?: number) => 
    showToast("error", title, description, duration), [showToast])
  
  const warning = useCallback((title: string, description: string = "", duration?: number) => 
    showToast("warning", title, description, duration), [showToast])
  
  const info = useCallback((title: string, description: string = "", duration?: number) => 
    showToast("info", title, description, duration), [showToast])

  return (
    <ToastContext.Provider value={{
      toast,
      showToast,
      hideToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
