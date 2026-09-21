import { Medicine, MedicineHistoryItem, AppNotification, DoseScheduleItem } from '../types';

const STORAGE_KEY_MEDICINES = 'med_tracker_medicines_v1';
const STORAGE_KEY_HISTORY = 'med_tracker_history_v1';
const STORAGE_KEY_NOTIFICATIONS = 'med_tracker_notifications_v1';
const STORAGE_KEY_DOSE_STATUSES = 'med_tracker_doses_status_v1';

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin Trihydrate',
    dosage: '500 mg',
    dosageQuantity: 1,
    form: 'capsule',
    category: 'Antibiotic',
    times: ['08:00', '20:00'],
    instructions: 'Take with a full glass of water after food. Complete full 7-day course.',
    currentStock: 3,
    stockUnit: 'capsules',
    lowStockThreshold: 6,
    color: 'amber',
    expiryDate: '2026-11-30',
    prescribedBy: 'Dr. Sarah Jenkins',
    notes: 'Finish prescribed course even if symptoms resolve.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-2',
    name: 'Metformin HCl',
    genericName: 'Metformin Hydrochloride',
    dosage: '850 mg',
    dosageQuantity: 1,
    form: 'tablet',
    category: 'Diabetes',
    times: ['08:30', '19:30'],
    instructions: 'Take with morning and evening meals to minimize GI side effects.',
    currentStock: 18,
    stockUnit: 'tablets',
    lowStockThreshold: 10,
    color: 'emerald',
    expiryDate: '2027-04-15',
    prescribedBy: 'Dr. Robert Chen (Endocrinology)',
    notes: 'Maintain steady carbohydrate intake.',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-3',
    name: 'Atorvastatin',
    genericName: 'Lipitor',
    dosage: '20 mg',
    dosageQuantity: 1,
    form: 'tablet',
    category: 'Cardiovascular',
    times: ['21:00'],
    instructions: 'Take once daily in the evening with or without food.',
    currentStock: 28,
    stockUnit: 'tablets',
    lowStockThreshold: 7,
    color: 'indigo',
    expiryDate: '2027-08-20',
    prescribedBy: 'Dr. Sarah Jenkins',
    notes: 'Avoid grapefruit and grapefruit juice.',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 & K2',
    genericName: 'Cholecalciferol',
    dosage: '2000 IU',
    dosageQuantity: 1,
    form: 'capsule',
    category: 'Vitamins & Supplements',
    times: ['09:00'],
    instructions: 'Take in the morning with dietary fat for optimal absorption.',
    currentStock: 4,
    stockUnit: 'capsules',
    lowStockThreshold: 8,
    color: 'rose',
    expiryDate: '2027-10-01',
    notes: 'Daily nutritional supplement.',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-5',
    name: 'Salbutamol Inhaler',
    genericName: 'Albuterol Sulfate',
    dosage: '100 mcg (2 puffs)',
    dosageQuantity: 2,
    form: 'inhaler',
    category: 'Respiratory',
    times: ['07:30', '19:00'],
    instructions: 'Inhale 2 puffs as directed. Rinse mouth with water after use.',
    currentStock: 38,
    stockUnit: 'doses',
    lowStockThreshold: 14,
    color: 'sky',
    expiryDate: '2027-02-28',
    prescribedBy: 'Pulmonology Clinic',
    notes: 'Keep inhaler mouthpiece clean.',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_HISTORY: MedicineHistoryItem[] = [
  {
    id: 'hist-1',
    medicineId: 'med-2',
    medicineName: 'Metformin HCl',
    action: 'taken',
    dosage: '850 mg',
    quantityChanged: -1,
    remainingStockAfter: 18,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Taken with breakfast',
  },
  {
    id: 'hist-2',
    medicineId: 'med-1',
    medicineName: 'Amoxicillin',
    action: 'taken',
    dosage: '500 mg',
    quantityChanged: -1,
    remainingStockAfter: 3,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: 'Taken on time',
  },
  {
    id: 'hist-3',
    medicineId: 'med-3',
    medicineName: 'Atorvastatin',
    action: 'taken',
    dosage: '20 mg',
    quantityChanged: -1,
    remainingStockAfter: 28,
    timestamp: new Date(Date.now() - 86400000 * 1 - 3600000 * 3).toISOString(),
    notes: 'Taken before sleep',
  },
  {
    id: 'hist-4',
    medicineId: 'med-2',
    medicineName: 'Metformin HCl',
    action: 'refilled',
    dosage: '850 mg',
    quantityChanged: 30,
    remainingStockAfter: 30,
    timestamp: new Date(Date.now() - 86400000 * 6).toISOString(),
    notes: 'Pharmacy refill picked up',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'low_stock',
    title: 'Low Stock Alert: Amoxicillin',
    message: 'Only 3 capsules remaining (threshold is 6). Refill recommended soon.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    medicineId: 'med-1',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'low_stock',
    title: 'Low Stock Alert: Vitamin D3 & K2',
    message: 'Only 4 capsules remaining (threshold is 8). Please plan a refill.',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    medicineId: 'med-4',
    read: false,
  },
];

export function loadMedicines(): Medicine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEDICINES);
    if (!raw) {
      saveMedicines(INITIAL_MEDICINES);
      return INITIAL_MEDICINES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading medicines:', e);
    return INITIAL_MEDICINES;
  }
}

export function saveMedicines(medicines: Medicine[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(medicines));
  } catch (e) {
    console.error('Error saving medicines:', e);
  }
}

export function loadHistory(): MedicineHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) {
      saveHistory(INITIAL_HISTORY);
      return INITIAL_HISTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading history:', e);
    return INITIAL_HISTORY;
  }
}

export function saveHistory(history: MedicineHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history:', e);
  }
}

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) {
      saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading notifications:', e);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
}

// Stores day-specific dose actions: { "YYYY-MM-DD_medId_time": { status: "taken"|"skipped"|"snoozed", takenAt?: string } }
export type DoseStatusMap = Record<string, { status: DoseScheduleItem['status']; takenAt?: string; snoozedUntil?: string }>;

export function loadDoseStatuses(): DoseStatusMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOSE_STATUSES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error loading dose statuses:', e);
    return {};
  }
}

export function saveDoseStatuses(statuses: DoseStatusMap) {
  try {
    localStorage.setItem(STORAGE_KEY_DOSE_STATUSES, JSON.stringify(statuses));
  } catch (e) {
    console.error('Error saving dose statuses:', e);
  }
}

export function resetAllData(): {
  medicines: Medicine[];
  history: MedicineHistoryItem[];
  notifications: AppNotification[];
  doseStatuses: DoseStatusMap;
} {
  saveMedicines(INITIAL_MEDICINES);
  saveHistory(INITIAL_HISTORY);
  saveNotifications(INITIAL_NOTIFICATIONS);
  saveDoseStatuses({});
  return {
    medicines: INITIAL_MEDICINES,
    history: INITIAL_HISTORY,
    notifications: INITIAL_NOTIFICATIONS,
    doseStatuses: {},
  };
}
