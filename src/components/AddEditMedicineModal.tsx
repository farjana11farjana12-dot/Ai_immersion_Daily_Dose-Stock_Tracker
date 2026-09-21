import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, ShieldAlert, Pill } from 'lucide-react';
import { Medicine, MedicineForm, MedicineCategory } from '../types';

interface AddEditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicineData: Partial<Medicine>) => void;
  initialMedicine?: Medicine | null;
}

const FORM_OPTIONS: { value: MedicineForm; label: string }[] = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Liquid / Syrup (ml)' },
  { value: 'drops', label: 'Drops' },
  { value: 'inhaler', label: 'Inhaler / Puffs' },
  { value: 'injection', label: 'Injection / Pen' },
  { value: 'cream', label: 'Topical Cream' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_OPTIONS: MedicineCategory[] = [
  'Antibiotic',
  'Cardiovascular',
  'Diabetes',
  'Pain Relief',
  'Vitamins & Supplements',
  'Respiratory',
  'Digestive',
  'Allergy',
  'Mental Health',
  'Other',
];

const COLOR_OPTIONS = ['emerald', 'indigo', 'amber', 'rose', 'sky', 'violet', 'teal'];

export const AddEditMedicineModal: React.FC<AddEditMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMedicine,
}) => {
  const isEditing = Boolean(initialMedicine);

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [category, setCategory] = useState<MedicineCategory>('Other');
  const [dosage, setDosage] = useState('1 tablet');
  const [dosageQuantity, setDosageQuantity] = useState(1);
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [instructions, setInstructions] = useState('');
  const [currentStock, setCurrentStock] = useState(30);
  const [stockUnit, setStockUnit] = useState('tablets');
  const [lowStockThreshold, setLowStockThreshold] = useState(7);
  const [color, setColor] = useState('emerald');
  const [expiryDate, setExpiryDate] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialMedicine) {
      setName(initialMedicine.name);
      setGenericName(initialMedicine.genericName || '');
      setForm(initialMedicine.form);
      setCategory(initialMedicine.category);
      setDosage(initialMedicine.dosage);
      setDosageQuantity(initialMedicine.dosageQuantity);
      setTimes(initialMedicine.times.length > 0 ? initialMedicine.times : ['08:00']);
      setInstructions(initialMedicine.instructions || '');
      setCurrentStock(initialMedicine.currentStock);
      setStockUnit(initialMedicine.stockUnit);
      setLowStockThreshold(initialMedicine.lowStockThreshold);
      setColor(initialMedicine.color || 'emerald');
      setExpiryDate(initialMedicine.expiryDate || '');
      setPrescribedBy(initialMedicine.prescribedBy || '');
      setNotes(initialMedicine.notes || '');
    } else {
      // Default new medicine state
      setName('');
      setGenericName('');
      setForm('tablet');
      setCategory('Pain Relief');
      setDosage('500 mg');
      setDosageQuantity(1);
      setTimes(['08:00', '20:00']);
      setInstructions('Take with water after food');
      setCurrentStock(30);
      setStockUnit('tablets');
      setLowStockThreshold(8);
      setColor('emerald');
      setExpiryDate('');
      setPrescribedBy('');
      setNotes('');
    }
    setErrors({});
  }, [initialMedicine, isOpen]);

  // Update default stock unit when form changes
  const handleFormChange = (newForm: MedicineForm) => {
    setForm(newForm);
    if (!initialMedicine) {
      if (newForm === 'capsule') setStockUnit('capsules');
      else if (newForm === 'tablet') setStockUnit('tablets');
      else if (newForm === 'syrup') setStockUnit('ml');
      else if (newForm === 'drops') setStockUnit('drops');
      else if (newForm === 'inhaler') setStockUnit('doses');
      else setStockUnit('units');
    }
  };

  const handleAddTime = () => {
    setTimes([...times, '12:00']);
  };

  const handleRemoveTime = (index: number) => {
    if (times.length <= 1) return;
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...times];
    updated[index] = val;
    setTimes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Medicine name is required';
    }
    if (currentStock < 0) {
      newErrors.currentStock = 'Stock cannot be negative';
    }
    if (lowStockThreshold < 1) {
      newErrors.lowStockThreshold = 'Threshold must be at least 1';
    }
    if (times.length === 0) {
      newErrors.times = 'At least one reminder time is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Sort times chronologically
    const sortedTimes = [...times].sort();

    onSave({
      ...(initialMedicine ? { id: initialMedicine.id } : {}),
      name: name.trim(),
      genericName: genericName.trim() || undefined,
      form,
      category,
      dosage: dosage.trim() || '1 dose',
      dosageQuantity: Number(dosageQuantity) || 1,
      times: sortedTimes,
      instructions: instructions.trim(),
      currentStock: Number(currentStock),
      stockUnit: stockUnit.trim() || 'units',
      lowStockThreshold: Number(lowStockThreshold),
      color,
      expiryDate: expiryDate || undefined,
      prescribedBy: prescribedBy.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Medicine Details' : 'Add New Medicine'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure dosage, reminder alarm times, and low-inventory threshold
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Name and Generic Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicine Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-med-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amoxicillin, Metformin, Lipitor"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Generic Name / Active Ingredient
              </label>
              <input
                id="input-med-generic"
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Amoxicillin Trihydrate"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Form & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dosage Form
              </label>
              <select
                id="select-med-form"
                value={form}
                onChange={(e) => handleFormChange(e.target.value as MedicineForm)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              >
                {FORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                id="select-med-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as MedicineCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Strength & Quantity per intake */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dosage Strength / Description
              </label>
              <input
                id="input-med-dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500 mg, 1 tablet, 10 ml"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Units Deducted per Intake
              </label>
              <input
                id="input-med-dosage-qty"
                type="number"
                min="1"
                value={dosageQuantity}
                onChange={(e) => setDosageQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                Number of stock items removed when logging "Take Dose"
              </p>
            </div>
          </div>

          {/* Row 4: Reminder Times Schedule */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-800">
                  Scheduled Reminder Times (Daily)
                </span>
              </div>
              <button
                type="button"
                id="btn-add-time"
                onClick={handleAddTime}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-teal-700 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {times.map((timeVal, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-white p-1.5 rounded-lg border border-slate-200"
                >
                  <input
                    type="time"
                    value={timeVal}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 outline-none bg-transparent"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.times && <p className="text-xs text-rose-600 mt-1">{errors.times}</p>}
          </div>

          {/* Row 5: Stock and Low-Stock Alert Limit */}
          <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Inventory & Low-Stock Alert Limit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Stock
                </label>
                <input
                  id="input-med-current-stock"
                  type="number"
                  min="0"
                  required
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Name
                </label>
                <input
                  id="input-med-stock-unit"
                  type="text"
                  value={stockUnit}
                  onChange={(e) => setStockUnit(e.target.value)}
                  placeholder="tablets, capsules, ml"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Low-Stock Alert Limit
                </label>
                <input
                  id="input-med-threshold"
                  type="number"
                  min="1"
                  required
                  value={lowStockThreshold}
                  onChange={(e) =>
                    setLowStockThreshold(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-sm font-semibold text-rose-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
                <p className="text-[10px] text-rose-700 mt-0.5">
                  Triggers alert when stock ≤ this number
                </p>
              </div>
            </div>
          </div>

          {/* Row 6: Instructions & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intake Instructions
              </label>
              <input
                id="input-med-instructions"
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take with food, Drink full glass of water"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                id="input-med-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Row 7: Prescriber & Color Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prescribing Doctor / Clinic
              </label>
              <input
                id="input-med-prescriber"
                type="text"
                value={prescribedBy}
                onChange={(e) => setPrescribedBy(e.target.value)}
                placeholder="e.g. Dr. Jenkins, Cardiology Clinic"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color Tag Indicator
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      color === c ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'
                    } ${
                      c === 'emerald'
                        ? 'bg-emerald-500'
                        : c === 'indigo'
                        ? 'bg-indigo-500'
                        : c === 'amber'
                        ? 'bg-amber-500'
                        : c === 'rose'
                        ? 'bg-rose-500'
                        : c === 'sky'
                        ? 'bg-sky-500'
                        : c === 'violet'
                        ? 'bg-violet-500'
                        : 'bg-teal-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-medicine"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              {isEditing ? 'Save Changes' : 'Add to Cabinet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
