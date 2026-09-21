import React from 'react';
import { Bell, Volume2, VolumeX, Plus, Clock, Pill, RotateCcw } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playReminderSound } from '../utils/audio';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  lowStockCount: number;
  currentTime: Date;
  isSimulatedTime: boolean;
  onAdvanceTime: (hours: number) => void;
  onResetTime: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenNotifications,
  unreadNotifsCount,
  lowStockCount,
  currentTime,
  isSimulatedTime,
  onAdvanceTime,
  onResetTime,
  onResetData,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playReminderSound();
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-none">
                  MedRemind & Stock
                </h1>
                {lowStockCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                    {lowStockCount} Low Stock
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Medication schedule & smart inventory manager
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="btn-notifications-mobile"
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>
            <button
              id="btn-add-medicine-mobile"
              type="button"
              onClick={onOpenAddModal}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm"
              aria-label="Add Medicine"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center/Right Toolbar: Clock, Sound, Time simulator & Action buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-sm">
          {/* Real-time Clock display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-900">{formattedTime}</span>
              <span className="text-slate-500 ml-1.5 hidden sm:inline">({formattedDate})</span>
            </div>
            {isSimulatedTime && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Simulated
              </span>
            )}
          </div>

          {/* Time simulation tools for quick testing reminder events */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-500 px-1 text-[11px]">Test Time:</span>
            <button
              type="button"
              onClick={() => onAdvanceTime(1)}
              title="Fast forward simulated time by 1 hour"
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition-colors"
            >
              +1h
            </button>
            <button
              type="button"
              onClick={() => onAdvanceTime(4)}
              title="Fast forward simulated time by 4 hours"
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition-colors"
            >
              +4h
            </button>
            {isSimulatedTime && (
              <button
                type="button"
                onClick={onResetTime}
                title="Reset time to actual system clock"
                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded font-medium transition-colors"
              >
                Reset Clock
              </button>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            type="button"
            onClick={toggleSound}
            title={soundOn ? 'Audio chime is enabled (Click to mute)' : 'Audio chime is muted (Click to enable)'}
            className={`p-2 rounded-lg border transition-colors ${
              soundOn
                ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notification Button Desktop */}
          <button
            id="btn-notifications-desktop"
            type="button"
            onClick={onOpenNotifications}
            className="relative hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-medium">Alerts</span>
            {unreadNotifsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Reset Demo Data button */}
          <button
            type="button"
            onClick={onResetData}
            title="Reset to initial sample medications & history"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-medium">Reset Demo</span>
          </button>

          {/* Add Medicine Button Desktop */}
          <button
            id="btn-add-medicine-desktop"
            type="button"
            onClick={onOpenAddModal}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-xs text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>
    </header>
  );
};
