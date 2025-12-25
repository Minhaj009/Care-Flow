import { useState } from 'react';
import { X, Syringe, AlertTriangle } from 'lucide-react';
import { Immunization, Patient } from '../types';

interface ImmunizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Immunization>) => Promise<void>;
  patient: Patient;
  editingImmunization?: Immunization | null;
}

const COMMON_VACCINES = [
  { name: 'Hepatitis B', cvx: '08' },
  { name: 'DTaP', cvx: '20' },
  { name: 'Hib (Haemophilus influenzae)', cvx: '17' },
  { name: 'IPV (Polio)', cvx: '10' },
  { name: 'PCV13 (Pneumococcal)', cvx: '133' },
  { name: 'Rotavirus', cvx: '116' },
  { name: 'MMR (Measles, Mumps, Rubella)', cvx: '03' },
  { name: 'Varicella (Chickenpox)', cvx: '21' },
  { name: 'Hepatitis A', cvx: '83' },
  { name: 'Influenza', cvx: '141' },
  { name: 'COVID-19 (Pfizer)', cvx: '208' },
  { name: 'COVID-19 (Moderna)', cvx: '207' },
  { name: 'Tdap', cvx: '115' },
  { name: 'HPV', cvx: '165' },
  { name: 'Meningococcal ACWY', cvx: '114' },
  { name: 'Meningococcal B', cvx: '162' },
  { name: 'BCG', cvx: '19' },
  { name: 'Typhoid', cvx: '25' },
  { name: 'Yellow Fever', cvx: '37' },
  { name: 'Rabies', cvx: '18' },
];

const ADMINISTRATION_SITES = [
  'Left Deltoid',
  'Right Deltoid',
  'Left Thigh',
  'Right Thigh',
  'Left Gluteal',
  'Right Gluteal',
  'Other'
];

const ROUTES = [
  'Intramuscular',
  'Subcutaneous',
  'Intradermal',
  'Oral',
  'Nasal',
  'Other'
];

export const ImmunizationModal = ({
  isOpen,
  onClose,
  onSave,
  patient,
  editingImmunization
}: ImmunizationModalProps) => {
  const [formData, setFormData] = useState<Partial<Immunization>>(
    editingImmunization || {
      vaccine_name: '',
      cvx_code: '',
      manufacturer: '',
      lot_number: '',
      expiration_date: '',
      dose_number: 1,
      dose_series: 1,
      administration_site: 'Left Deltoid',
      route: 'Intramuscular',
      administered_date: new Date().toISOString().split('T')[0],
      adverse_reaction: false,
      adverse_reaction_details: '',
      notes: ''
    }
  );
  const [saving, setSaving] = useState(false);
  const [showVaccineList, setShowVaccineList] = useState(false);

  const handleSelectVaccine = (vaccine: { name: string; cvx: string }) => {
    setFormData({
      ...formData,
      vaccine_name: vaccine.name,
      cvx_code: vaccine.cvx
    });
    setShowVaccineList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Syringe className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingImmunization ? 'Edit Immunization' : 'Record Immunization'}
              </h2>
              <p className="text-sm text-gray-600">Patient: {patient.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccine Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.vaccine_name || ''}
                  onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
                  onFocus={() => setShowVaccineList(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Type or select vaccine..."
                  required
                />
                {showVaccineList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {COMMON_VACCINES.filter(v =>
                      v.name.toLowerCase().includes((formData.vaccine_name || '').toLowerCase())
                    ).map((vaccine, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectVaccine(vaccine)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>{vaccine.name}</span>
                        <span className="text-xs text-gray-500">CVX: {vaccine.cvx}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVX Code
              </label>
              <input
                type="text"
                value={formData.cvx_code || ''}
                onChange={(e) => setFormData({ ...formData, cvx_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., 08"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., Pfizer, Merck"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot Number *
              </label>
              <input
                type="text"
                value={formData.lot_number || ''}
                onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., AB1234"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiration_date || ''}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dose Number
              </label>
              <input
                type="number"
                min="1"
                value={formData.dose_number || 1}
                onChange={(e) => setFormData({ ...formData, dose_number: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Doses in Series
              </label>
              <input
                type="number"
                min="1"
                value={formData.dose_series || 1}
                onChange={(e) => setFormData({ ...formData, dose_series: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Administration Site *
              </label>
              <select
                value={formData.administration_site || ''}
                onChange={(e) => setFormData({ ...formData, administration_site: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                {ADMINISTRATION_SITES.map((site) => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route *
              </label>
              <select
                value={formData.route || ''}
                onChange={(e) => setFormData({ ...formData, route: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                {ROUTES.map((route) => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Administration Date *
              </label>
              <input
                type="date"
                value={formData.administered_date || ''}
                onChange={(e) => setFormData({ ...formData, administered_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="adverse_reaction"
                checked={formData.adverse_reaction || false}
                onChange={(e) => setFormData({ ...formData, adverse_reaction: e.target.checked })}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="adverse_reaction" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Adverse Reaction Observed
              </label>
            </div>

            {formData.adverse_reaction && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reaction Details
                </label>
                <textarea
                  value={formData.adverse_reaction_details || ''}
                  onChange={(e) => setFormData({ ...formData, adverse_reaction_details: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Describe the adverse reaction..."
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Syringe className="w-4 h-4" />
                  Save Immunization
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
