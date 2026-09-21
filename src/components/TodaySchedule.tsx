import React, { useState } from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  Pill,
  Info,
  CalendarDays,
  BellRing,
} from 'lucide-react';
import { DoseScheduleItem, Medicine } from '../types';
import { formatTime12h, getThemeColor } from '../utils/helpers';

interface TodayScheduleProps {
  doses: DoseScheduleItem[];
  currentTime: Date;
  onTakeDose: (dose: DoseScheduleItem) => void;
  onSkipDose: (dose: DoseScheduleItem) => void;
  onSnoozeDose: (dose: DoseScheduleItem) => void;
  onUndoDose: (dose: DoseScheduleItem) => void;
  onOpenMedicineDetails?: (medicine: Medicine) => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  doses,
  currentTime,
  onTakeDose,
  onSkipDose,
  onSnoozeDose,
  onUndoDose,
  onOpenMedicineDetails,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken' | 'skipped'>('all');

  // Parse current HH:MM in local time
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const filteredDoses = doses.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getDoseTimingStatus = (item: DoseScheduleItem) => {
    if (item.status === 'taken') return { label: 'Taken', type: 'taken' };
    if (item.status === 'skipped') return { label: 'Skipped', type: 'skipped' };
    if (item.status === 'snoozed') return { label: 'Snoozed (+15m)', type: 'snoozed' };

    const [h, m] = item.time.split(':').map(Number);
    const doseTotalMinutes = h * 60 + m;
    const diff = doseTotalMinutes - currentTotalMinutes;

    if (diff < -30) {
      return { label: 'Overdue', type: 'overdue' };
    }
    if (diff <= 15 && diff >= -30) {
      return { label: 'Due Now', type: 'due' };
    }
    return { label: `Upcoming in ${Math.round(diff / 60 * 10) / 10}h`, type: 'upcoming' };
  };

  return (
    <div id="today-schedule-section" className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Today's Dose Schedule</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log your medication intakes to track stock and maintain adherence
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({doses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'pending'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({doses.filter((d) => d.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('taken')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'taken'
                ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Taken ({doses.filter((d) => d.status === 'taken').length})
          </button>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="mt-4 space-y-3">
        {filteredDoses.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <Check className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No doses match this filter</p>
            <p className="text-xs text-slate-500 mt-0.5">All scheduled medication for this state are accounted for</p>
          </div>
        ) : (
          filteredDoses.map((item) => {
            const timing = getDoseTimingStatus(item);
            const med = item.medicine;
            const theme = getThemeColor(med.color);
            const isOutOfStock = med.currentStock <= 0;
            const isLowStock = med.currentStock <= med.lowStockThreshold;

            return (
              <div
                key={item.id}
                id={`dose-card-${item.id}`}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.status === 'taken'
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : timing.type === 'due'
                    ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-200'
                    : timing.type === 'overdue'
                    ? 'bg-rose-50/30 border-rose-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Time badge & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="flex flex-col items-center justify-center w-16 h-14 bg-slate-100/90 rounded-lg border border-slate-200 shrink-0 text-center">
                    <Clock className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {formatTime12h(item.time).split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase">
                      {formatTime12h(item.time).split(' ')[1]}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {med.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {med.dosage}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        timing.type === 'taken'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : timing.type === 'due'
                          ? 'bg-teal-100 text-teal-800 border-teal-300 animate-pulse'
                          : timing.type === 'overdue'
                          ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold'
                          : timing.type === 'skipped'
                          ? 'bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {timing.label}
                      </span>
                    </div>

                    {/* Instructions */}
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500 font-medium">Take:</span>
                      <span>{med.dosageQuantity} {med.stockUnit}</span>
                      <span className="text-slate-300">•</span>
                      <span className="italic text-slate-500">{med.instructions}</span>
                    </div>

                    {/* Stock Status Indicator */}
                    <div className="mt-1.5 flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Stock:</span>
                      <span
                        className={`font-semibold ${
                          isOutOfStock
                            ? 'text-rose-700'
                            : isLowStock
                            ? 'text-amber-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {med.currentStock} {med.stockUnit} remaining
                      </span>
                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3" />
                          Low stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.status === 'pending' || item.status === 'snoozed' ? (
                    <>
                      <button
                        type="button"
                        id={`btn-take-dose-${item.id}`}
                        onClick={() => onTakeDose(item)}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Cannot take: medicine is out of stock' : 'Take dose and log stock deduction'}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>Take Dose</span>
                      </button>

                      <button
                        type="button"
                        id={`btn-snooze-${item.id}`}
                        onClick={() => onSnoozeDose(item)}
                        title="Snooze reminder for 15 minutes"
                        className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs transition-colors"
                      >
                        <BellRing className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        id={`btn-skip-dose-${item.id}`}
                        onClick={() => onSkipDose(item)}
                        title="Mark dose as skipped"
                        className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg text-xs transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">
                        {item.status === 'taken' && item.takenAt
                          ? `Logged at ${new Date(item.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : item.status === 'skipped'
                          ? 'Dose skipped'
                          : 'Completed'}
                      </span>
                      <button
                        type="button"
                        id={`btn-undo-dose-${item.id}`}
                        onClick={() => onUndoDose(item)}
                        title="Undo status and restore stock"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
