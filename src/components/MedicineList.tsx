import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Package,
} from 'lucide-react';
import { Medicine, MedicineCategory } from '../types';
import {
  formatTime12h,
  calculateDaysRemaining,
  getStockStatus,
  getThemeColor,
} from '../utils/helpers';

interface MedicineListProps {
  medicines: Medicine[];
  onOpenAddModal: () => void;
  onOpenEditModal: (medicine: Medicine) => void;
  onOpenRefillModal: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
  selectedFilterCategory?: string;
}

export const MedicineList: React.FC<MedicineListProps> = ({
  medicines,
  onOpenAddModal,
  onOpenEditModal,
  onOpenRefillModal,
  onDeleteMedicine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'adequate' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'stock-asc' | 'name' | 'times'>('stock-asc');

  // Distinct categories available in cabinet
  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach((m) => set.add(m.category));
    return ['All', ...Array.from(set)];
  }, [medicines]);

  // Filtered and sorted medicines
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) => {
        const matchesSearch =
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (med.genericName && med.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          med.instructions.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'All' || med.category === categoryFilter;

        const isLow = med.currentStock <= med.lowStockThreshold && med.currentStock > 0;
        const isOut = med.currentStock <= 0;
        const isAdequate = med.currentStock > med.lowStockThreshold;

        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'low' && isLow) ||
          (stockFilter === 'out' && isOut) ||
          (stockFilter === 'adequate' && isAdequate);

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'stock-asc') {
          return a.currentStock - b.currentStock;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'times') {
          return b.times.length - a.times.length;
        }
        return 0;
      });
  }, [medicines, searchQuery, categoryFilter, stockFilter, sortBy]);

  return (
    <div id="medicine-inventory-section" className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Medicine Cabinet & Stock Levels</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor inventory, adjust reminder schedules, and configure alert thresholds
          </p>
        </div>

        <button
          type="button"
          id="btn-add-medicine-section"
          onClick={onOpenAddModal}
          className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search & Filters bar */}
      <div className="mt-4 flex flex-col lg:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-medicines"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine name, generic title, or condition..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stock Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                stockFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('low')}
              className={`px-2 py-1 rounded-md transition-colors ${
                stockFilter === 'low'
                  ? 'bg-rose-100 text-rose-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('adequate')}
              className={`px-2 py-1 rounded-md transition-colors ${
                stockFilter === 'adequate'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Adequate
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            id="select-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            id="select-sort-medicines"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="stock-asc">Sort: Lowest Stock First</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="times">Sort: Most Frequent</option>
          </select>
        </div>
      </div>

      {/* Grid of Medicine Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMedicines.length === 0 ? (
          <div className="col-span-full text-center py-12 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No medicines found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try modifying your search query or add a new medicine to your cabinet.
            </p>
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const daysRemaining = calculateDaysRemaining(med);
            const stockStatus = getStockStatus(med);
            const theme = getThemeColor(med.color);
            const isLow = med.currentStock <= med.lowStockThreshold;
            const isOut = med.currentStock <= 0;

            // Compute progress bar percentage relative to safety capacity (e.g. 3x threshold or min 30)
            const maxRef = Math.max(med.lowStockThreshold * 2.5, med.currentStock, 20);
            const progressPercent = Math.min(100, Math.round((med.currentStock / maxRef) * 100));

            return (
              <div
                key={med.id}
                id={`medicine-card-${med.id}`}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isOut
                    ? 'bg-rose-50/50 border-rose-300'
                    : isLow
                    ? 'bg-amber-50/30 border-amber-300 ring-1 ring-amber-200/50'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Top: Name, Form & Category */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {med.name}
                        </h3>
                        {med.genericName && (
                          <p className="text-[11px] text-slate-500 truncate italic">
                            {med.genericName}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {med.category}
                    </span>
                  </div>

                  {/* Dosage and Instructions */}
                  <div className="mt-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-500">Dosage:</span>
                      <span className="font-semibold text-slate-800">
                        {med.dosage} ({med.dosageQuantity} {med.stockUnit}/intake)
                      </span>
                    </div>
                    {med.instructions && (
                      <p className="text-slate-500 text-[11px] italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        {med.instructions}
                      </p>
                    )}
                  </div>

                  {/* Reminder Times Tags */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Reminder Times:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {med.times.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          {formatTime12h(t)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stock Gauge & Alert Box */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">Remaining Stock:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${
                            isOut
                              ? 'text-rose-700'
                              : isLow
                              ? 'text-amber-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {med.currentStock} {med.stockUnit}
                        </span>
                        {isLow && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            Low Alert
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isOut
                            ? 'bg-rose-600'
                            : isLow
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                      />
                    </div>

                    {/* Threshold info and days of supply */}
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Alert limit: ≤ {med.lowStockThreshold} {med.stockUnit}</span>
                      <span className="font-medium text-slate-600">
                        {isOut
                          ? 'Empty'
                          : `~${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    id={`btn-refill-card-${med.id}`}
                    onClick={() => onOpenRefillModal(med)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Refill Stock</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-edit-card-${med.id}`}
                    onClick={() => onOpenEditModal(med)}
                    title="Edit medicine details and reminder times"
                    className="p-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    id={`btn-delete-card-${med.id}`}
                    onClick={() => onDeleteMedicine(med.id)}
                    title="Delete medicine"
                    className="p-1.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
