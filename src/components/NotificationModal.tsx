import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Package,
} from 'lucide-react';
import { AppNotification } from '../types';
import { formatDateTimeDisplay } from '../utils/helpers';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'reminder':
        return (
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'refill_success':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread alert(s)` : 'All alerts caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                title="Mark all notifications as read"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                title="Clear all alerts"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Alerts */}
        <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No alerts right now</p>
              <p className="text-xs text-slate-500 mt-1">
                You will receive reminder alerts when doses are due and warning alerts when stock is
                low.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl flex items-start gap-3 transition-colors ${
                  !notif.read ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50'
                }`}
              >
                {getIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold truncate ${
                        notif.type === 'low_stock' || notif.type === 'out_of_stock'
                          ? 'text-rose-800'
                          : 'text-slate-900'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDateTimeDisplay(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Automatic low-stock limits active</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
