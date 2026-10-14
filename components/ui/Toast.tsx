import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.type === 'loading' || !toast.duration) return;

    const duration = toast.duration;
    const interval = 16; // ~60fps
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    const removeTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(removeTimer);
    };
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    loading: <Loader2 className="w-5 h-5 text-jung-accent animate-spin" />,
  };

  const styles = {
    success: 'border-emerald-200 bg-emerald-50/90',
    error: 'border-red-200 bg-red-50/90',
    info: 'border-blue-200 bg-blue-50/90',
    loading: 'border-jung-accent/30 bg-jung-surface',
  };

  return (
    <div
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
        border min-w-[300px] max-w-[400px]
        transition-all duration-300 ease-out
        ${styles[toast.type]}
        ${isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}
      `}
      role="alert"
      aria-live="polite"
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm font-serif text-jung-dark">{toast.message}</span>
      <button
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-jung-muted" />
      </button>
      
      {/* Progress bar */}
      {toast.type !== 'loading' && toast.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-current opacity-30 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
};

// Hook for using toasts
let addToastCallback: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  // Expose global add function for non-React usage
  useEffect(() => {
    addToastCallback = addToast;
    return () => {
      addToastCallback = null;
    };
  }, [addToast]);

  const success = useCallback((message: string, duration = 4000) => {
    return addToast({ message, type: 'success', duration });
  }, [addToast]);

  const error = useCallback((message: string, duration = 5000) => {
    return addToast({ message, type: 'error', duration });
  }, [addToast]);

  const info = useCallback((message: string, duration = 4000) => {
    return addToast({ message, type: 'info', duration });
  }, [addToast]);

  const loading = useCallback((message: string) => {
    return addToast({ message, type: 'loading' });
  }, [addToast]);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    loading,
    dismiss,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />,
  };
};

// Global toast function for use outside React components
export const toast = {
  success: (message: string, duration?: number) => addToastCallback?.({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => addToastCallback?.({ message, type: 'error', duration }),
  info: (message: string, duration?: number) => addToastCallback?.({ message, type: 'info', duration }),
  loading: (message: string) => addToastCallback?.({ message, type: 'loading' }),
};
