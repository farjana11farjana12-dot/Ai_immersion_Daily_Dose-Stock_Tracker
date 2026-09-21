export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'cream' | 'other';

export type MedicineCategory =
  | 'Antibiotic'
  | 'Cardiovascular'
  | 'Diabetes'
  | 'Pain Relief'
  | 'Vitamins & Supplements'
  | 'Respiratory'
  | 'Digestive'
  | 'Allergy'
  | 'Mental Health'
  | 'Other';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string; // e.g. "500 mg" or "1 tablet"
  dosageQuantity: number; // Number of stock units deducted per intake, typically 1 or 2
  form: MedicineForm;
  category: MedicineCategory;
  times: string[]; // 24h format "HH:MM", e.g. ["08:00", "20:00"]
  instructions: string; // e.g. "Take after meals with water"
  currentStock: number;
  stockUnit: string; // "tablets", "capsules", "ml", "doses", "sprays"
  lowStockThreshold: number; // triggers alert when currentStock <= lowStockThreshold
  color: string; // e.g. 'emerald', 'sky', 'violet', 'rose', 'amber', 'teal', 'indigo'
  expiryDate?: string;
  prescribedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'snoozed';

export interface DoseScheduleItem {
  id: string;
  medicineId: string;
  medicine: Medicine;
  time: string; // "08:00"
  status: DoseStatus;
  dateStr: string; // "YYYY-MM-DD"
  takenAt?: string; // ISO string
  snoozedUntil?: string; // ISO string
}

export type HistoryAction = 'taken' | 'skipped' | 'refilled' | 'stock_adjusted' | 'added';

export interface MedicineHistoryItem {
  id: string;
  medicineId: string;
  medicineName: string;
  action: HistoryAction;
  timestamp: string; // ISO string
  dosage?: string;
  quantityChanged?: number; // e.g. -1 for taken, +30 for refill
  remainingStockAfter: number;
  notes?: string;
}

export interface AppNotification {
  id: string;
  type: 'reminder' | 'low_stock' | 'out_of_stock' | 'refill_success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  medicineId?: string;
  read: boolean;
}
