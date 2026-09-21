import { Medicine } from '../types';

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return time24;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minuteFormatted = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hour12}:${minuteFormatted} ${ampm}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(isoOrDateStr: string): string {
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return isoOrDateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoOrDateStr;
  }
}

export function formatDateTimeDisplay(isoOrDateStr: string): string {
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return isoOrDateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoOrDateStr;
  }
}

export function calculateDailyIntake(med: Medicine): number {
  const timesPerDay = med.times.length || 1;
  const perDoseQty = med.dosageQuantity || 1;
  return timesPerDay * perDoseQty;
}

export function calculateDaysRemaining(med: Medicine): number {
  const daily = calculateDailyIntake(med);
  if (daily <= 0) return 0;
  return Math.floor(med.currentStock / daily);
}

export function getStockStatus(med: Medicine): 'out' | 'critical' | 'low' | 'adequate' | 'good' {
  if (med.currentStock <= 0) return 'out';
  if (med.currentStock <= Math.max(1, Math.floor(med.lowStockThreshold * 0.5))) return 'critical';
  if (med.currentStock <= med.lowStockThreshold) return 'low';
  if (med.currentStock <= med.lowStockThreshold * 2) return 'adequate';
  return 'good';
}

export const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string; ring: string }> = {
  emerald: {
    bg: 'bg-emerald-50 text-emerald-900',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ring: 'focus:ring-emerald-500',
  },
  indigo: {
    bg: 'bg-indigo-50 text-indigo-900',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    ring: 'focus:ring-indigo-500',
  },
  amber: {
    bg: 'bg-amber-50 text-amber-900',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    ring: 'focus:ring-amber-500',
  },
  rose: {
    bg: 'bg-rose-50 text-rose-900',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    ring: 'focus:ring-rose-500',
  },
  sky: {
    bg: 'bg-sky-50 text-sky-900',
    text: 'text-sky-700',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    ring: 'focus:ring-sky-500',
  },
  violet: {
    bg: 'bg-violet-50 text-violet-900',
    text: 'text-violet-700',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    ring: 'focus:ring-violet-500',
  },
  teal: {
    bg: 'bg-teal-50 text-teal-900',
    text: 'text-teal-700',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    ring: 'focus:ring-teal-500',
  },
};

export function getThemeColor(color?: string) {
  if (!color || !COLOR_MAP[color]) {
    return COLOR_MAP.indigo;
  }
  return COLOR_MAP[color];
}
