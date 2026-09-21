import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Medicine,
  DoseScheduleItem,
  MedicineHistoryItem,
  AppNotification,
  DoseStatus,
} from './types';
import {
  loadMedicines,
  saveMedicines,
  loadHistory,
  saveHistory,
  loadNotifications,
  saveNotifications,
  loadDoseStatuses,
  saveDoseStatuses,
  resetAllData,
  DoseStatusMap,
} from './utils/storage';
import { getTodayDateString, formatTime12h } from './utils/helpers';
import {
  playReminderSound,
  playTakenSuccessSound,
  playLowStockAlertSound,
} from './utils/audio';

import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { LowStockBanner } from './components/LowStockBanner';
import { TodaySchedule } from './components/TodaySchedule';
import { MedicineList } from './components/MedicineList';
import { MedicineHistory } from './components/MedicineHistory';
import { AddEditMedicineModal } from './components/AddEditMedicineModal';
import { RefillModal } from './components/RefillModal';
import { NotificationModal } from './components/NotificationModal';
import { ToastAlert, ToastMessage } from './components/ToastAlert';
import { Calendar, Package, History as HistoryIcon, LayoutDashboard, Plus } from 'lucide-react';

export default function App() {
  // Primary persistent state
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<MedicineHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [doseStatuses, setDoseStatuses] = useState<DoseStatusMap>({});

  // Clock & Time simulation
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isSimulatedTime, setIsSimulatedTime] = useState(false);
  const timeOffsetMsRef = useRef<number>(0);

  // Active UI Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'inventory' | 'history'>('overview');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [refillTargetMedicine, setRefillTargetMedicine] = useState<Medicine | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Toast alerts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Track checked reminder slots to avoid repeated notifications in the same hour/minute
  const alertedDoseSlotsRef = useRef<Set<string>>(new Set());

  // Load initial data from storage on mount
  useEffect(() => {
    setMedicines(loadMedicines());
    setHistory(loadHistory());
    setNotifications(loadNotifications());
    setDoseStatuses(loadDoseStatuses());
  }, []);

  // Sync state changes to storage
  useEffect(() => {
    if (medicines.length > 0) saveMedicines(medicines);
  }, [medicines]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveDoseStatuses(doseStatuses);
  }, [doseStatuses]);

  // Real-time clock ticker (with support for simulated offset)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date(Date.now() + timeOffsetMsRef.current);
      setCurrentTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to add toast message
  const addToast = (
    type: ToastMessage['type'],
    title: string,
    message?: string,
    duration: number = 4500,
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      duration,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Time simulation controls
  const handleAdvanceTime = (hours: number) => {
    timeOffsetMsRef.current += hours * 3600 * 1000;
    setIsSimulatedTime(true);
    const newTime = new Date(Date.now() + timeOffsetMsRef.current);
    setCurrentTime(newTime);
    addToast('info', 'Clock Advanced', `Simulated time is now ${newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (+${hours}h)`);
  };

  const handleResetTime = () => {
    timeOffsetMsRef.current = 0;
    setIsSimulatedTime(false);
    setCurrentTime(new Date());
    addToast('info', 'Clock Restored', 'Clock synchronized to real system time.');
  };

  // Low stock calculation
  const lowStockMedicines = useMemo(() => {
    return medicines.filter((m) => m.currentStock <= m.lowStockThreshold);
  }, [medicines]);

  // Today's Date String
  const todayStr = useMemo(() => {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [currentTime]);

  // Generate today's schedule items
  const todayDoses = useMemo<DoseScheduleItem[]>(() => {
    const items: DoseScheduleItem[] = [];

    medicines.forEach((med) => {
      med.times.forEach((timeStr) => {
        const slotKey = `${todayStr}_${med.id}_${timeStr}`;
        const savedStatus = doseStatuses[slotKey];

        items.push({
          id: slotKey,
          medicineId: med.id,
          medicine: med,
          time: timeStr,
          status: savedStatus?.status || 'pending',
          dateStr: todayStr,
          takenAt: savedStatus?.takenAt,
          snoozedUntil: savedStatus?.snoozedUntil,
        });
      });
    });

    // Sort chronologically by time
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [medicines, doseStatuses, todayStr]);

  // Automated Dose Reminder & Alert Monitor
  useEffect(() => {
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    todayDoses.forEach((item) => {
      if (item.status === 'pending') {
        const [h, m] = item.time.split(':').map(Number);
        const doseTotalMinutes = h * 60 + m;

        // If dose is due within current minute window and has not been notified yet today
        const slotId = `${item.id}_${todayStr}`;
        if (Math.abs(currentTotalMinutes - doseTotalMinutes) <= 2 && !alertedDoseSlotsRef.current.has(slotId)) {
          alertedDoseSlotsRef.current.add(slotId);

          // Play reminder sound
          playReminderSound();

          // Add notification
          const notif: AppNotification = {
            id: `reminder-${Date.now()}-${item.id}`,
            type: 'reminder',
            title: `Reminder: Time for ${item.medicine.name}`,
            message: `Scheduled dosage: ${item.medicine.dosage} (${item.medicine.instructions || 'take with water'}).`,
            timestamp: new Date().toISOString(),
            medicineId: item.medicine.id,
            read: false,
          };
          setNotifications((prev) => [notif, ...prev]);

          addToast(
            'info',
            `Medication Reminder: ${item.medicine.name}`,
            `Scheduled for ${formatTime12h(item.time)}. Please take ${item.medicine.dosage}.`,
            6000,
          );
        }
      }
    });
  }, [currentTime, todayDoses, todayStr]);

  // Action: Take Dose
  const handleTakeDose = (doseItem: DoseScheduleItem) => {
    const med = medicines.find((m) => m.id === doseItem.medicineId);
    if (!med) return;

    if (med.currentStock <= 0) {
      addToast('error', 'Cannot Take Dose', `${med.name} is completely out of stock. Please refill immediately.`);
      return;
    }

    const unitsToDeduct = med.dosageQuantity || 1;
    const newStock = Math.max(0, med.currentStock - unitsToDeduct);
    const nowIso = new Date().toISOString();

    // 1. Update medicine stock
    const updatedMedicines = medicines.map((m) =>
      m.id === med.id ? { ...m, currentStock: newStock, updatedAt: nowIso } : m,
    );
    setMedicines(updatedMedicines);

    // 2. Mark dose as taken in daily status map
    const slotKey = doseItem.id;
    const updatedStatuses: DoseStatusMap = {
      ...doseStatuses,
      [slotKey]: { status: 'taken', takenAt: nowIso },
    };
    setDoseStatuses(updatedStatuses);

    // 3. Append to history
    const historyEntry: MedicineHistoryItem = {
      id: `hist-${Date.now()}`,
      medicineId: med.id,
      medicineName: med.name,
      action: 'taken',
      timestamp: nowIso,
      dosage: med.dosage,
      quantityChanged: -unitsToDeduct,
      remainingStockAfter: newStock,
      notes: `Taken at ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    setHistory((prev) => [historyEntry, ...prev]);

    // 4. Play success audio
    playTakenSuccessSound();

    addToast(
      'success',
      `Dose Recorded: ${med.name}`,
      `Remaining stock: ${newStock} ${med.stockUnit}.`,
    );

    // 5. Check if stock now dropped to or below the lowStockThreshold
    if (newStock <= med.lowStockThreshold) {
      setTimeout(() => {
        playLowStockAlertSound();

        const notif: AppNotification = {
          id: `lowstock-${Date.now()}-${med.id}`,
          type: newStock === 0 ? 'out_of_stock' : 'low_stock',
          title: newStock === 0 ? `OUT OF STOCK: ${med.name}` : `Low Stock Alert: ${med.name}`,
          message:
            newStock === 0
              ? `${med.name} is completely out of stock!`
              : `Only ${newStock} ${med.stockUnit} remaining (threshold is ${med.lowStockThreshold}). Please replenish soon.`,
          timestamp: new Date().toISOString(),
          medicineId: med.id,
          read: false,
        };
        setNotifications((prev) => [notif, ...prev]);

        addToast(
          'warning',
          newStock === 0 ? `⚠️ OUT OF STOCK: ${med.name}` : `⚠️ Low Stock Warning: ${med.name}`,
          `Stock is down to ${newStock} ${med.stockUnit} (Alert threshold: ${med.lowStockThreshold}).`,
          7000,
        );
      }, 500);
    }
  };

  // Action: Skip Dose
  const handleSkipDose = (doseItem: DoseScheduleItem) => {
    const med = medicines.find((m) => m.id === doseItem.medicineId);
    if (!med) return;

    const nowIso = new Date().toISOString();
    const slotKey = doseItem.id;
    const updatedStatuses: DoseStatusMap = {
      ...doseStatuses,
      [slotKey]: { status: 'skipped', takenAt: nowIso },
    };
    setDoseStatuses(updatedStatuses);

    // Add skipped entry to history
    const historyEntry: MedicineHistoryItem = {
      id: `hist-${Date.now()}`,
      medicineId: med.id,
      medicineName: med.name,
      action: 'skipped',
      timestamp: nowIso,
      dosage: med.dosage,
      remainingStockAfter: med.currentStock,
      notes: 'Dose marked as skipped by user',
    };
    setHistory((prev) => [historyEntry, ...prev]);

    addToast('info', `Dose Skipped: ${med.name}`, 'Skipped intake logged in history.');
  };

  // Action: Snooze Dose
  const handleSnoozeDose = (doseItem: DoseScheduleItem) => {
    const slotKey = doseItem.id;
    const snoozedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const updatedStatuses: DoseStatusMap = {
      ...doseStatuses,
      [slotKey]: { status: 'snoozed', snoozedUntil },
    };
    setDoseStatuses(updatedStatuses);

    addToast(
      'info',
      `Snoozed ${doseItem.medicine.name}`,
      'Reminder postponed by 15 minutes.',
    );
  };

  // Action: Undo Dose
  const handleUndoDose = (doseItem: DoseScheduleItem) => {
    const med = medicines.find((m) => m.id === doseItem.medicineId);
    if (!med) return;

    const slotKey = doseItem.id;
    const prevStatus = doseStatuses[slotKey]?.status;

    // Restore stock if it was taken
    let restoredStock = med.currentStock;
    if (prevStatus === 'taken') {
      const unitsToRestore = med.dosageQuantity || 1;
      restoredStock = med.currentStock + unitsToRestore;
      const updatedMedicines = medicines.map((m) =>
        m.id === med.id ? { ...m, currentStock: restoredStock } : m,
      );
      setMedicines(updatedMedicines);
    }

    const { [slotKey]: _, ...remainingStatuses } = doseStatuses;
    setDoseStatuses(remainingStatuses);

    addToast('info', `Status Reset: ${med.name}`, 'Dose reset to pending.');
  };

  // Action: Refill Medicine Stock
  const handleConfirmRefill = (medicineId: string, quantityToAdd: number, notes?: string) => {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;

    const newStock = med.currentStock + quantityToAdd;
    const nowIso = new Date().toISOString();

    const updatedMedicines = medicines.map((m) =>
      m.id === med.id ? { ...m, currentStock: newStock, updatedAt: nowIso } : m,
    );
    setMedicines(updatedMedicines);

    // Append to history
    const historyEntry: MedicineHistoryItem = {
      id: `hist-${Date.now()}`,
      medicineId: med.id,
      medicineName: med.name,
      action: 'refilled',
      timestamp: nowIso,
      dosage: med.dosage,
      quantityChanged: quantityToAdd,
      remainingStockAfter: newStock,
      notes: notes || `Pharmacy refill (+${quantityToAdd} ${med.stockUnit})`,
    };
    setHistory((prev) => [historyEntry, ...prev]);

    // Record notification
    const notif: AppNotification = {
      id: `refill-${Date.now()}-${med.id}`,
      type: 'refill_success',
      title: `Stock Refilled: ${med.name}`,
      message: `Added +${quantityToAdd} ${med.stockUnit}. Total stock is now ${newStock}.`,
      timestamp: nowIso,
      medicineId: med.id,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast(
      'success',
      `Stock Refilled: ${med.name}`,
      `Added +${quantityToAdd} ${med.stockUnit}. Current stock is now ${newStock}.`,
    );
  };

  // Quick 1-click refill (+30)
  const handleQuickRefill = (medicine: Medicine, count: number) => {
    handleConfirmRefill(medicine.id, count, `Quick refill (+${count} ${medicine.stockUnit})`);
  };

  // Action: Save Added or Edited Medicine
  const handleSaveMedicine = (data: Partial<Medicine>) => {
    const nowIso = new Date().toISOString();

    if (data.id) {
      // Editing existing medicine
      const updated = medicines.map((m) =>
        m.id === data.id
          ? ({ ...m, ...data, updatedAt: nowIso } as Medicine)
          : m,
      );
      setMedicines(updated);
      addToast('success', 'Medicine Updated', `${data.name} details have been updated.`);
    } else {
      // Adding new medicine
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        name: data.name || 'New Medicine',
        genericName: data.genericName,
        dosage: data.dosage || '1 dose',
        dosageQuantity: data.dosageQuantity || 1,
        form: data.form || 'tablet',
        category: data.category || 'Other',
        times: data.times || ['08:00'],
        instructions: data.instructions || '',
        currentStock: Number(data.currentStock) || 0,
        stockUnit: data.stockUnit || 'units',
        lowStockThreshold: Number(data.lowStockThreshold) || 5,
        color: data.color || 'emerald',
        expiryDate: data.expiryDate,
        prescribedBy: data.prescribedBy,
        notes: data.notes,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setMedicines((prev) => [...prev, newMed]);

      // Add to history log
      const hist: MedicineHistoryItem = {
        id: `hist-${Date.now()}`,
        medicineId: newMed.id,
        medicineName: newMed.name,
        action: 'added',
        timestamp: nowIso,
        dosage: newMed.dosage,
        remainingStockAfter: newMed.currentStock,
        notes: 'Added new medicine to cabinet',
      };
      setHistory((prev) => [hist, ...prev]);

      addToast(
        'success',
        'Medicine Added',
        `${newMed.name} added to your cabinet with ${newMed.times.length} daily reminder(s).`,
      );

      // Check if added with stock already at or below threshold
      if (newMed.currentStock <= newMed.lowStockThreshold) {
        addToast(
          'warning',
          `Low Stock Warning: ${newMed.name}`,
          `Initial stock (${newMed.currentStock}) is at or below alert limit (${newMed.lowStockThreshold}).`,
        );
      }
    }
  };

  // Action: Delete Medicine
  const handleDeleteMedicine = (id: string) => {
    const med = medicines.find((m) => m.id === id);
    if (!med) return;

    if (window.confirm(`Are you sure you want to remove ${med.name} from your cabinet?`)) {
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      addToast('info', 'Medicine Removed', `${med.name} removed from your cabinet.`);
    }
  };

  // Reset to Demo Data
  const handleResetData = () => {
    if (window.confirm('Reset all medications, history, and alert statuses to initial sample data?')) {
      const initial = resetAllData();
      setMedicines(initial.medicines);
      setHistory(initial.history);
      setNotifications(initial.notifications);
      setDoseStatuses(initial.doseStatuses);
      alertedDoseSlotsRef.current.clear();
      addToast('info', 'Demo Data Restored', 'Cabinet refreshed with sample medications.');
    }
  };

  // Clear History
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all medication history logs?')) {
      setHistory([]);
      addToast('info', 'History Cleared', 'All intake logs have been cleared.');
    }
  };

  // Notifications actions
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-500/20 selection:text-teal-900">
      {/* Top Navigation & Live Clock Header */}
      <Header
        onOpenAddModal={() => {
          setEditingMedicine(null);
          setIsAddModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        lowStockCount={lowStockMedicines.length}
        currentTime={currentTime}
        isSimulatedTime={isSimulatedTime}
        onAdvanceTime={handleAdvanceTime}
        onResetTime={handleResetTime}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              id="tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-teal-600" />
              <span>Dashboard Overview</span>
            </button>

            <button
              type="button"
              id="tab-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Today's Schedule ({todayDoses.length})</span>
            </button>

            <button
              type="button"
              id="tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-teal-600" />
              <span>Medicine Cabinet ({medicines.length})</span>
              {lowStockMedicines.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              type="button"
              id="tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HistoryIcon className="w-4 h-4 text-teal-600" />
              <span>Audit History ({history.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingMedicine(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medicine</span>
          </button>
        </div>

        {/* Prominent Low Stock Alert Banner (Always visible when stock is low) */}
        <LowStockBanner
          lowStockMedicines={lowStockMedicines}
          onOpenRefillModal={(med) => {
            setRefillTargetMedicine(med);
            setIsRefillModalOpen(true);
          }}
          onQuickRefill={handleQuickRefill}
        />

        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Stat Overview Cards */}
            <DashboardStats
              medicines={medicines}
              todayDoses={todayDoses}
              lowStockMedicines={lowStockMedicines}
              onScrollToLowStock={() => setActiveTab('inventory')}
              onScrollToSchedule={() => setActiveTab('schedule')}
              onScrollToInventory={() => setActiveTab('inventory')}
            />

            {/* Two-column layout: Today's Schedule on Left, Quick Cabinet Stock on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <TodaySchedule
                  doses={todayDoses}
                  currentTime={currentTime}
                  onTakeDose={handleTakeDose}
                  onSkipDose={handleSkipDose}
                  onSnoozeDose={handleSnoozeDose}
                  onUndoDose={handleUndoDose}
                />
              </div>

              <div className="lg:col-span-5">
                <MedicineList
                  medicines={medicines}
                  onOpenAddModal={() => {
                    setEditingMedicine(null);
                    setIsAddModalOpen(true);
                  }}
                  onOpenEditModal={(med) => {
                    setEditingMedicine(med);
                    setIsAddModalOpen(true);
                  }}
                  onOpenRefillModal={(med) => {
                    setRefillTargetMedicine(med);
                    setIsRefillModalOpen(true);
                  }}
                  onDeleteMedicine={handleDeleteMedicine}
                />
              </div>
            </div>

            {/* Recent History Preview */}
            <MedicineHistory
              history={history.slice(0, 8)}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}

        {/* 2. Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <TodaySchedule
              doses={todayDoses}
              currentTime={currentTime}
              onTakeDose={handleTakeDose}
              onSkipDose={handleSkipDose}
              onSnoozeDose={handleSnoozeDose}
              onUndoDose={handleUndoDose}
            />
          </div>
        )}

        {/* 3. Medicine Cabinet & Stock Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <MedicineList
              medicines={medicines}
              onOpenAddModal={() => {
                setEditingMedicine(null);
                setIsAddModalOpen(true);
              }}
              onOpenEditModal={(med) => {
                setEditingMedicine(med);
                setIsAddModalOpen(true);
              }}
              onOpenRefillModal={(med) => {
                setRefillTargetMedicine(med);
                setIsRefillModalOpen(true);
              }}
              onDeleteMedicine={handleDeleteMedicine}
            />
          </div>
        )}

        {/* 4. History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <MedicineHistory history={history} onClearHistory={handleClearHistory} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <p>
          Medicine Reminder & Stock Alert System • Safe & Timely Dosage Management with Automatic
          Inventory Warnings
        </p>
      </footer>

      {/* Add / Edit Medicine Modal */}
      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMedicine(null);
        }}
        onSave={handleSaveMedicine}
        initialMedicine={editingMedicine}
      />

      {/* Refill Stock Modal */}
      <RefillModal
        isOpen={isRefillModalOpen}
        onClose={() => {
          setIsRefillModalOpen(false);
          setRefillTargetMedicine(null);
        }}
        medicine={refillTargetMedicine}
        onConfirmRefill={handleConfirmRefill}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
      />

      {/* Toast Alert Popups */}
      <ToastAlert toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
