import React, { useState, useMemo } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  PlusCircle,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
} from 'lucide-react';
import { MedicineHistoryItem, HistoryAction } from '../types';
import { formatDateTimeDisplay } from '../utils/helpers';

interface MedicineHistoryProps {
  history: MedicineHistoryItem[];
  onClearHistory: () => void;
}

export const MedicineHistory: React.FC<MedicineHistoryProps> = ({
  history,
  onClearHistory,
}) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesAction = filterAction === 'all' || item.action === filterAction;
      const matchesSearch =
        item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesAction && matchesSearch;
    });
  }, [history, filterAction, searchQuery]);

  // Download log as a text summary
  const handleExportLog = () => {
    if (history.length === 0) return;
    const lines = [
      '====================================================',
      'MEDICINE REMINDER & STOCK ALERT SYSTEM - AUDIT LOG',
      `Exported on: ${new Date().toLocaleString()}`,
      '====================================================\n',
    ];

    history.forEach((h) => {
      lines.push(
        `[${new Date(h.timestamp).toLocaleString()}] ${h.action.toUpperCase()} - ${h.medicineName}`,
      );
      if (h.dosage) lines.push(`  Dosage: ${h.dosage}`);
      if (h.quantityChanged !== undefined) {
        lines.push(`  Quantity: ${h.quantityChanged > 0 ? `+${h.quantityChanged}` : h.quantityChanged}`);
      }
      lines.push(`  Stock Balance: ${h.remainingStockAfter}`);
      if (h.notes) lines.push(`  Notes: ${h.notes}`);
      lines.push('----------------------------------------------------');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medication_history_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: HistoryAction) => {
    switch (action) {
      case 'taken':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Taken
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
            <XCircle className="w-3 h-3" />
            Skipped
          </span>
        );
      case 'refilled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            <RefreshCw className="w-3 h-3" />
            Refilled
          </span>
        );
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
            <PlusCircle className="w-3 h-3" />
            Added
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {action}
          </span>
        );
    }
  };

  return (
    <div id="medicine-history-section" className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Medicine & Stock History Log</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete audit trail of taken doses, skipped intakes, and pharmacy stock refills
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportLog}
            disabled={history.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search toolbar */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-history"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history by medicine or notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterAction('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterAction === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('taken')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterAction === 'taken'
                ? 'bg-white text-emerald-800 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Taken
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('refilled')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterAction === 'refilled'
                ? 'bg-white text-teal-800 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Refills
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('skipped')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterAction === 'skipped'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skipped
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="mt-4 divide-y divide-slate-100 max-h-[420px] overflow-y-auto border border-slate-100 rounded-lg">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50">
            <History className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No activity logged yet</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Intakes, skips, and stock refills will automatically appear here.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">{getActionBadge(item.action)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.medicineName}</span>
                    {item.dosage && (
                      <span className="text-xs text-slate-500 font-medium">({item.dosage})</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{formatDateTimeDisplay(item.timestamp)}</span>
                    {item.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-600">{item.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Remaining Stock Balance after this action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs shrink-0 pt-1 sm:pt-0">
                <span className="text-slate-400 text-[11px]">Stock Balance:</span>
                <span className="font-bold text-slate-800">
                  {item.remainingStockAfter} remaining
                </span>
                {item.quantityChanged !== undefined && (
                  <span
                    className={`text-[11px] font-semibold ${
                      item.quantityChanged > 0 ? 'text-teal-600' : 'text-slate-500'
                    }`}
                  >
                    {item.quantityChanged > 0 ? `+${item.quantityChanged}` : `${item.quantityChanged}`}{' '}
                    unit(s)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
