import { createContext, useContext } from 'react'

export interface ToastMessage {
  title: string
  description: string
}

export const ToastContext = createContext<((message: ToastMessage) => void) | null>(null)

export function useToast() {
  const showToast = useContext(ToastContext)

  if (!showToast) {
    throw new Error('useToast must be used inside ToastProvider.')
  }

  return showToast
}
