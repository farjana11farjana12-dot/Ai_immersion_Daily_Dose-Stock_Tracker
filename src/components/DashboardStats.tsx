import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, PackageCheck, ArrowRight } from 'lucide-react';
import { Medicine, DoseScheduleItem } from '../types';
import { formatTime12h } from '../utils/helpers';

interface DashboardStatsProps {
  medicines: Medicine[];
  todayDoses: DoseScheduleItem[];
  lowStockMedicines: Medicine[];
  onScrollToLowStock: () => void;
  onScrollToSchedule: () => void;
  onScrollToInventory: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  medicines,
  todayDoses,
  lowStockMedicines,
  onScrollToLowStock,
  onScrollToSchedule,
  onScrollToInventory,
}) => {
  const totalToday = todayDoses.length;
  const takenToday = todayDoses.filter((d) => d.status === 'taken').length;
  const adherenceRate = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 100;

  // Find next upcoming dose today
  const pendingDoses = todayDoses.filter((d) => d.status === 'pending');
  const nextDose = pendingDoses.length > 0 ? pendingDoses[0] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Low Stock Card */}
      <div
        id="stat-card-low-stock"
        onClick={lowStockMedicines.length > 0 ? onScrollToLowStock : onScrollToInventory}
        className={`p-4 rounded-xl border transition-all cursor-pointer ${
          lowStockMedicines.length > 0
            ? 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/80 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Stock Health
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockMedicines.length > 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold ${
              lowStockMedicines.length > 0 ? 'text-rose-700' : 'text-slate-800'
            }`}
          >
            {lowStockMedicines.length}
          </span>
          <span className="text-xs text-slate-500">
            {lowStockMedicines.length === 1 ? 'item needs refill' : 'items need refill'}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={`font-medium ${
              lowStockMedicines.length > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {lowStockMedicines.length > 0
              ? 'Low-stock threshold reached'
              : 'All supplies sufficient'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* 2. Today's Adherence Card */}
      <div
        id="stat-card-adherence"
        onClick={onScrollToSchedule}
        className="p-4 rounded-xl border bg-white border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Today's Adherence
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{adherenceRate}%</span>
          <span className="text-xs text-slate-500">
            ({takenToday}/{totalToday} doses taken)
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${adherenceRate}%` }}
          />
        </div>
      </div>

      {/* 3. Next Due Dose */}
      <div
        id="stat-card-next-dose"
        onClick={onScrollToSchedule}
        className="p-4 rounded-xl border bg-white border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Next Dose
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          {nextDose ? (
            <div>
              <p className="text-base font-bold text-slate-900 truncate">
                {nextDose.medicine.name}
              </p>
              <p className="text-xs text-sky-700 font-medium">
                Scheduled at {formatTime12h(nextDose.time)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-bold text-emerald-700">All Done Today</p>
              <p className="text-xs text-slate-500">No more scheduled doses</p>
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>{pendingDoses.length} pending today</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* 4. Total Medicines Cabinet */}
      <div
        id="stat-card-medicines"
        onClick={onScrollToInventory}
        className="p-4 rounded-xl border bg-white border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Prescriptions
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{medicines.length}</span>
          <span className="text-xs text-slate-500">medications in cabinet</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>Manage & refill</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
