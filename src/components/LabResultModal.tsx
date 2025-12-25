import { useState } from 'react';
import { X, FlaskConical, AlertTriangle } from 'lucide-react';
import { LabResult, Patient } from '../types';

interface LabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<LabResult>) => Promise<void>;
  patient: Patient;
}

const TEST_CATEGORIES = [
  'Chemistry',
  'Hematology',
  'Urinalysis',
  'Microbiology',
  'Immunology',
  'Coagulation',
  'Endocrine',
  'Other'
];

const COMMON_TESTS: Record<string, { name: string; unit: string; low: string; high: string }[]> = {
  'Chemistry': [
    { name: 'Glucose (Fasting)', unit: 'mg/dL', low: '70', high: '100' },
    { name: 'HbA1c', unit: '%', low: '4.0', high: '5.6' },
    { name: 'BUN', unit: 'mg/dL', low: '7', high: '20' },
    { name: 'Creatinine', unit: 'mg/dL', low: '0.7', high: '1.3' },
    { name: 'Sodium', unit: 'mEq/L', low: '136', high: '145' },
    { name: 'Potassium', unit: 'mEq/L', low: '3.5', high: '5.0' },
    { name: 'Chloride', unit: 'mEq/L', low: '98', high: '106' },
    { name: 'CO2', unit: 'mEq/L', low: '23', high: '29' },
    { name: 'Calcium', unit: 'mg/dL', low: '8.5', high: '10.5' },
    { name: 'Total Protein', unit: 'g/dL', low: '6.0', high: '8.3' },
    { name: 'Albumin', unit: 'g/dL', low: '3.5', high: '5.0' },
    { name: 'Bilirubin (Total)', unit: 'mg/dL', low: '0.1', high: '1.2' },
    { name: 'ALT', unit: 'U/L', low: '7', high: '56' },
    { name: 'AST', unit: 'U/L', low: '10', high: '40' },
    { name: 'Alkaline Phosphatase', unit: 'U/L', low: '44', high: '147' },
    { name: 'GGT', unit: 'U/L', low: '9', high: '48' },
    { name: 'LDH', unit: 'U/L', low: '140', high: '280' },
    { name: 'Uric Acid', unit: 'mg/dL', low: '3.4', high: '7.0' },
    { name: 'Cholesterol (Total)', unit: 'mg/dL', low: '0', high: '200' },
    { name: 'LDL Cholesterol', unit: 'mg/dL', low: '0', high: '100' },
    { name: 'HDL Cholesterol', unit: 'mg/dL', low: '40', high: '200' },
    { name: 'Triglycerides', unit: 'mg/dL', low: '0', high: '150' },
  ],
  'Hematology': [
    { name: 'WBC', unit: 'x10^3/uL', low: '4.5', high: '11.0' },
    { name: 'RBC', unit: 'x10^6/uL', low: '4.5', high: '5.5' },
    { name: 'Hemoglobin', unit: 'g/dL', low: '12.0', high: '17.5' },
    { name: 'Hematocrit', unit: '%', low: '36', high: '50' },
    { name: 'MCV', unit: 'fL', low: '80', high: '100' },
    { name: 'MCH', unit: 'pg', low: '27', high: '33' },
    { name: 'MCHC', unit: 'g/dL', low: '32', high: '36' },
    { name: 'RDW', unit: '%', low: '11.5', high: '14.5' },
    { name: 'Platelet Count', unit: 'x10^3/uL', low: '150', high: '400' },
    { name: 'MPV', unit: 'fL', low: '7.5', high: '11.5' },
    { name: 'Neutrophils', unit: '%', low: '40', high: '70' },
    { name: 'Lymphocytes', unit: '%', low: '20', high: '40' },
    { name: 'Monocytes', unit: '%', low: '2', high: '8' },
    { name: 'Eosinophils', unit: '%', low: '1', high: '4' },
    { name: 'Basophils', unit: '%', low: '0', high: '1' },
    { name: 'ESR', unit: 'mm/hr', low: '0', high: '20' },
  ],
  'Coagulation': [
    { name: 'PT', unit: 'seconds', low: '11', high: '13.5' },
    { name: 'INR', unit: '', low: '0.8', high: '1.1' },
    { name: 'PTT', unit: 'seconds', low: '25', high: '35' },
    { name: 'Fibrinogen', unit: 'mg/dL', low: '200', high: '400' },
    { name: 'D-Dimer', unit: 'ng/mL', low: '0', high: '500' },
  ],
  'Endocrine': [
    { name: 'TSH', unit: 'mIU/L', low: '0.4', high: '4.0' },
    { name: 'Free T4', unit: 'ng/dL', low: '0.8', high: '1.8' },
    { name: 'Free T3', unit: 'pg/mL', low: '2.3', high: '4.2' },
    { name: 'Cortisol (AM)', unit: 'ug/dL', low: '6', high: '23' },
    { name: 'Testosterone (Total)', unit: 'ng/dL', low: '300', high: '1000' },
    { name: 'Estradiol', unit: 'pg/mL', low: '10', high: '400' },
    { name: 'FSH', unit: 'mIU/mL', low: '1.5', high: '12.4' },
    { name: 'LH', unit: 'mIU/mL', low: '1.7', high: '8.6' },
    { name: 'Prolactin', unit: 'ng/mL', low: '4', high: '23' },
    { name: 'Insulin (Fasting)', unit: 'uIU/mL', low: '2.6', high: '24.9' },
    { name: 'Vitamin D (25-OH)', unit: 'ng/mL', low: '30', high: '100' },
    { name: 'Vitamin B12', unit: 'pg/mL', low: '200', high: '900' },
    { name: 'Folate', unit: 'ng/mL', low: '3', high: '17' },
    { name: 'Ferritin', unit: 'ng/mL', low: '20', high: '300' },
    { name: 'Iron', unit: 'ug/dL', low: '60', high: '170' },
    { name: 'TIBC', unit: 'ug/dL', low: '250', high: '370' },
  ],
  'Urinalysis': [
    { name: 'Specific Gravity', unit: '', low: '1.005', high: '1.030' },
    { name: 'pH', unit: '', low: '4.5', high: '8.0' },
    { name: 'Protein', unit: '', low: '', high: '' },
    { name: 'Glucose', unit: '', low: '', high: '' },
    { name: 'Ketones', unit: '', low: '', high: '' },
    { name: 'Blood', unit: '', low: '', high: '' },
    { name: 'Leukocyte Esterase', unit: '', low: '', high: '' },
    { name: 'Nitrite', unit: '', low: '', high: '' },
  ],
  'Immunology': [
    { name: 'CRP', unit: 'mg/L', low: '0', high: '10' },
    { name: 'CRP (High Sensitivity)', unit: 'mg/L', low: '0', high: '3' },
    { name: 'ANA', unit: '', low: '', high: '' },
    { name: 'RF', unit: 'IU/mL', low: '0', high: '14' },
    { name: 'Anti-CCP', unit: 'U/mL', low: '0', high: '20' },
  ],
  'Microbiology': [
    { name: 'Blood Culture', unit: '', low: '', high: '' },
    { name: 'Urine Culture', unit: '', low: '', high: '' },
    { name: 'Wound Culture', unit: '', low: '', high: '' },
    { name: 'Stool Culture', unit: '', low: '', high: '' },
  ],
  'Other': []
};

const INTERPRETATIONS = [
  'Normal',
  'Abnormal Low',
  'Abnormal High',
  'Critical Low',
  'Critical High',
  'Pending'
];

export const LabResultModal = ({
  isOpen,
  onClose,
  onSave,
  patient
}: LabResultModalProps) => {
  const [formData, setFormData] = useState<Partial<LabResult>>({
    test_category: 'Chemistry',
    test_name: '',
    result_value: '',
    result_unit: '',
    reference_range_low: '',
    reference_range_high: '',
    interpretation: 'Normal',
    collection_date: new Date().toISOString().split('T')[0],
    result_date: new Date().toISOString().split('T')[0],
    ordering_provider: '',
    performing_lab: '',
    notes: '',
    is_reviewed: false
  });
  const [saving, setSaving] = useState(false);
  const [showTestList, setShowTestList] = useState(false);

  const handleSelectTest = (test: { name: string; unit: string; low: string; high: string }) => {
    setFormData({
      ...formData,
      test_name: test.name,
      result_unit: test.unit,
      reference_range_low: test.low,
      reference_range_high: test.high
    });
    setShowTestList(false);
  };

  const autoInterpret = () => {
    const value = parseFloat(formData.result_value || '');
    const low = parseFloat(formData.reference_range_low || '');
    const high = parseFloat(formData.reference_range_high || '');

    if (isNaN(value) || (isNaN(low) && isNaN(high))) return;

    let interpretation: string = 'Normal';
    if (!isNaN(low) && value < low) {
      interpretation = value < low * 0.5 ? 'Critical Low' : 'Abnormal Low';
    } else if (!isNaN(high) && value > high) {
      interpretation = value > high * 2 ? 'Critical High' : 'Abnormal High';
    }

    setFormData({ ...formData, interpretation: interpretation as any });
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

  const currentTests = COMMON_TESTS[formData.test_category || 'Chemistry'] || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Enter Lab Result</h2>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Category *
              </label>
              <select
                value={formData.test_category || ''}
                onChange={(e) => {
                  setFormData({ ...formData, test_category: e.target.value as any, test_name: '' });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              >
                {TEST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Name *
              </label>
              <input
                type="text"
                value={formData.test_name || ''}
                onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                onFocus={() => setShowTestList(true)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Type or select test..."
                required
              />
              {showTestList && currentTests.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {currentTests.filter(t =>
                    t.name.toLowerCase().includes((formData.test_name || '').toLowerCase())
                  ).map((test, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectTest(test)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      {test.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result Value *
              </label>
              <input
                type="text"
                value={formData.result_value || ''}
                onChange={(e) => setFormData({ ...formData, result_value: e.target.value })}
                onBlur={autoInterpret}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="e.g., 95"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={formData.result_unit || ''}
                onChange={(e) => setFormData({ ...formData, result_unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="e.g., mg/dL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Range Low
              </label>
              <input
                type="text"
                value={formData.reference_range_low || ''}
                onChange={(e) => setFormData({ ...formData, reference_range_low: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="e.g., 70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Range High
              </label>
              <input
                type="text"
                value={formData.reference_range_high || ''}
                onChange={(e) => setFormData({ ...formData, reference_range_high: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="e.g., 100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interpretation *
              </label>
              <select
                value={formData.interpretation || 'Normal'}
                onChange={(e) => setFormData({ ...formData, interpretation: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              >
                {INTERPRETATIONS.map((interp) => (
                  <option key={interp} value={interp}>{interp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Date *
              </label>
              <input
                type="date"
                value={formData.collection_date || ''}
                onChange={(e) => setFormData({ ...formData, collection_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result Date *
              </label>
              <input
                type="date"
                value={formData.result_date || ''}
                onChange={(e) => setFormData({ ...formData, result_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordering Provider
              </label>
              <input
                type="text"
                value={formData.ordering_provider || ''}
                onChange={(e) => setFormData({ ...formData, ordering_provider: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="e.g., Dr. Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performing Lab
              </label>
              <input
                type="text"
                value={formData.performing_lab || ''}
                onChange={(e) => setFormData({ ...formData, performing_lab: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="e.g., City Lab"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {formData.interpretation && ['Critical Low', 'Critical High'].includes(formData.interpretation) && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Critical Value</p>
                <p className="text-sm text-red-700">This result is marked as critical. Consider immediate clinical review and patient notification.</p>
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
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  Save Result
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
