import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X, Clock } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastAlertProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-white border-emerald-300 text-emerald-950 shadow-md',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-white border-amber-300 text-amber-950 shadow-md',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-white border-rose-300 text-rose-950 shadow-md',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
        };
      default:
        return {
          bg: 'bg-white border-slate-300 text-slate-900 shadow-md',
          icon: <Clock className="w-5 h-5 text-teal-600 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ${style.bg}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="mt-0.5">{style.icon}</div>
        <div>
          <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs text-slate-600 mt-0.5 leading-normal">{toast.message}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded-md transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
