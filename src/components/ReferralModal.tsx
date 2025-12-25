import { useState } from 'react';
import { X, Share2, AlertTriangle } from 'lucide-react';
import { Referral, Patient } from '../types';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Referral>) => Promise<void>;
  patient: Patient;
  editingReferral?: Referral | null;
}

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Hematology',
  'Infectious Disease',
  'Nephrology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology (ENT)',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Surgery - General',
  'Surgery - Cardiothoracic',
  'Surgery - Neurosurgery',
  'Surgery - Plastic',
  'Surgery - Vascular',
  'Urology',
  'Obstetrics & Gynecology',
  'Physical Medicine & Rehabilitation',
  'Pain Management',
  'Allergy & Immunology',
  'Other'
];

const REFERRAL_TYPES = [
  'Consultation',
  'Procedure',
  'Second Opinion',
  'Transfer of Care'
];

const TIMEFRAMES = [
  'Within 1 week',
  'Within 2 weeks',
  'Within 1 month',
  'Within 3 months',
  'Non-urgent',
  'As soon as possible'
];

export const ReferralModal = ({
  isOpen,
  onClose,
  onSave,
  patient,
  editingReferral
}: ReferralModalProps) => {
  const [formData, setFormData] = useState<Partial<Referral>>(
    editingReferral || {
      referral_type: 'Consultation',
      referred_to_specialty: '',
      referred_to_facility: '',
      referred_to_provider: '',
      reason_for_referral: '',
      clinical_information: '',
      priority: 'Routine',
      requested_timeframe: 'Within 1 month',
      appointment_date: '',
      notes: ''
    }
  );
  const [saving, setSaving] = useState(false);

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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingReferral ? 'Edit Referral' : 'Create Referral'}
              </h2>
              <p className="text-sm text-gray-600">Patient: {patient?.full_name}</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Type *
              </label>
              <select
                value={formData.referral_type || ''}
                onChange={(e) => setFormData({ ...formData, referral_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {REFERRAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority || 'Routine'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty *
              </label>
              <select
                value={formData.referred_to_specialty || ''}
                onChange={(e) => setFormData({ ...formData, referred_to_specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select specialty...</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested Timeframe
              </label>
              <select
                value={formData.requested_timeframe || ''}
                onChange={(e) => setFormData({ ...formData, requested_timeframe: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TIMEFRAMES.map((timeframe) => (
                  <option key={timeframe} value={timeframe}>{timeframe}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referred to Facility
              </label>
              <input
                type="text"
                value={formData.referred_to_facility || ''}
                onChange={(e) => setFormData({ ...formData, referred_to_facility: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., City Hospital"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referred to Provider
              </label>
              <input
                type="text"
                value={formData.referred_to_provider || ''}
                onChange={(e) => setFormData({ ...formData, referred_to_provider: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Dr. Smith"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Referral *
              </label>
              <textarea
                value={formData.reason_for_referral || ''}
                onChange={(e) => setFormData({ ...formData, reason_for_referral: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the reason for this referral..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinical Information to Share
              </label>
              <textarea
                value={formData.clinical_information || ''}
                onChange={(e) => setFormData({ ...formData, clinical_information: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Include relevant diagnoses, medications, test results..."
              />
            </div>

            {editingReferral && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={formData.appointment_date || ''}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className={editingReferral ? '' : 'md:col-span-2'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {formData.priority === 'Emergency' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Emergency Referral</p>
                <p className="text-sm text-red-700">This referral will be marked as emergency priority. Consider direct communication with the receiving provider.</p>
              </div>
            </div>
          )}

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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  {editingReferral ? 'Update Referral' : 'Create Referral'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
