import React from 'react';
import { AlertOctagon, PlusCircle, RefreshCw } from 'lucide-react';
import { Medicine } from '../types';
import { calculateDaysRemaining } from '../utils/helpers';

interface LowStockBannerProps {
  lowStockMedicines: Medicine[];
  onOpenRefillModal: (medicine: Medicine) => void;
  onQuickRefill: (medicine: Medicine, count: number) => void;
}

export const LowStockBanner: React.FC<LowStockBannerProps> = ({
  lowStockMedicines,
  onOpenRefillModal,
  onQuickRefill,
}) => {
  if (lowStockMedicines.length === 0) return null;

  return (
    <div
      id="low-stock-alert-container"
      className="bg-rose-50 border border-rose-300 rounded-xl p-4 sm:p-5 shadow-xs"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <AlertOctagon className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-rose-900">
                Low Stock Warning: {lowStockMedicines.length}{' '}
                {lowStockMedicines.length === 1 ? 'medication is' : 'medications are'} below safety
                threshold
              </h2>
              <p className="text-xs text-rose-700 mt-0.5">
                Automatic inventory alert triggered. Refill promptly to prevent missed doses.
              </p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-200 text-rose-900">
              Immediate Action Recommended
            </span>
          </div>

          {/* List of low stock medicines */}
          <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowStockMedicines.map((med) => {
              const daysLeft = calculateDaysRemaining(med);
              const isZero = med.currentStock <= 0;

              return (
                <div
                  key={med.id}
                  id={`low-stock-item-${med.id}`}
                  className="bg-white border border-rose-200 rounded-lg p-3 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm truncate">
                        {med.name}
                      </span>
                      <span className="text-xs text-slate-500">{med.dosage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span
                        className={`font-bold ${
                          isZero ? 'text-rose-700' : 'text-rose-600'
                        }`}
                      >
                        {isZero ? 'OUT OF STOCK' : `${med.currentStock} ${med.stockUnit} left`}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">
                        Min threshold: {med.lowStockThreshold} {med.stockUnit}
                      </span>
                      <span className="text-slate-400 hidden sm:inline">•</span>
                      <span className="text-slate-500 hidden sm:inline">
                        ~{daysLeft} {daysLeft === 1 ? 'day' : 'days'} supply
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      id={`btn-quick-refill-${med.id}`}
                      onClick={() => onQuickRefill(med, 30)}
                      title="Instantly add +30 units to stock"
                      className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold rounded-md border border-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+30</span>
                    </button>
                    <button
                      type="button"
                      id={`btn-custom-refill-${med.id}`}
                      onClick={() => onOpenRefillModal(med)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md border border-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Refill</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
