import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { Medicine } from '../types';

interface RefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onConfirmRefill: (medicineId: string, quantityToAdd: number, notes?: string) => void;
}

export const RefillModal: React.FC<RefillModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onConfirmRefill,
}) => {
  const [refillAmount, setRefillAmount] = useState<number>(30);
  const [notes, setNotes] = useState('');

  if (!isOpen || !medicine) return null;

  const newStock = medicine.currentStock + (Number(refillAmount) || 0);
  const willClearLowStock =
    medicine.currentStock <= medicine.lowStockThreshold && newStock > medicine.lowStockThreshold;

  const handleQuickSelect = (amt: number) => {
    setRefillAmount(amt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refillAmount <= 0) return;
    onConfirmRefill(medicine.id, refillAmount, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Refill Medication Stock</h3>
              <p className="text-xs text-slate-500">Replenish supply and update inventory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Medicine Card info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{medicine.name}</h4>
                <p className="text-xs text-slate-500">{medicine.dosage}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {medicine.category}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Current Stock</span>
                <span
                  className={`text-sm font-bold ${
                    medicine.currentStock <= medicine.lowStockThreshold
                      ? 'text-rose-600'
                      : 'text-slate-800'
                  }`}
                >
                  {medicine.currentStock} {medicine.stockUnit}
                </span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Alert Threshold</span>
                <span className="text-sm font-bold text-slate-700">
                  ≤ {medicine.lowStockThreshold} {medicine.stockUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Quick preset chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quick Add Presets:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 30, 60, 90].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickSelect(amt)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    refillAmount === amt
                      ? 'bg-teal-600 border-teal-600 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity to Add ({medicine.stockUnit})
            </label>
            <div className="relative">
              <input
                id="input-refill-amount"
                type="number"
                min="1"
                required
                value={refillAmount}
                onChange={(e) => setRefillAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                {medicine.stockUnit}
              </span>
            </div>
          </div>

          {/* New Stock Preview Banner */}
          <div className="p-3 rounded-lg border bg-emerald-50/60 border-emerald-200 text-xs">
            <div className="flex items-center justify-between font-semibold text-emerald-900">
              <span>Updated Stock Total:</span>
              <span className="text-sm font-bold text-emerald-700">
                {newStock} {medicine.stockUnit}
              </span>
            </div>
            {willClearLowStock && (
              <div className="mt-1 flex items-center gap-1 text-emerald-700 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>This refill clears the active low-stock alert!</span>
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              id="input-refill-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pharmacy pickup, 30-day bottle"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-refill"
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Confirm Refill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
