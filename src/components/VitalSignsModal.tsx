import { useState } from 'react';
import { X, Activity } from 'lucide-react';
import { VitalSigns } from '../types';
import { createVitalSigns } from '../services/databaseService';

interface VitalSignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (vitalSigns: VitalSigns) => void;
  patientId: string;
  visitId?: string;
  measuredBy: string;
}

export default function VitalSignsModal({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  visitId,
  measuredBy
}: VitalSignsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    temperature_unit: 'Celsius',
    pulse_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    height: '',
    notes: ''
  });

  const getStatusColor = (value: number, range: [number, number, number, number]): string => {
    const [low, normalLow, normalHigh, high] = range;
    if (value < low || value > high) return 'text-red-600';
    if (value < normalLow || value > normalHigh) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const vitalSignsData: Partial<VitalSigns> = {
        patient_id: patientId,
        visit_id: visitId || null,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        temperature_unit: formData.temperature_unit,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : null,
        respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : null,
        oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        notes: formData.notes
      };

      const newVitalSigns = await createVitalSigns(vitalSignsData, measuredBy);
      onSuccess(newVitalSigns);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save vital signs');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Record Vital Signs</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure (Systolic)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="120"
                    value={formData.blood_pressure_systolic}
                    onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    mmHg
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Normal: 90-120 mmHg</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure (Diastolic)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="80"
                    value={formData.blood_pressure_diastolic}
                    onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    mmHg
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Normal: 60-80 mmHg</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.temperature_unit}
                    onChange={(e) => setFormData({ ...formData, temperature_unit: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Celsius">°C</option>
                    <option value="Fahrenheit">°F</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Normal: {formData.temperature_unit === 'Celsius' ? '36.5-37.5 °C' : '97.7-99.5 °F'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pulse Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="72"
                    value={formData.pulse_rate}
                    onChange={(e) => setFormData({ ...formData, pulse_rate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    bpm
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Normal: 60-100 bpm</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respiratory Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="16"
                    value={formData.respiratory_rate}
                    onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    breaths/min
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Normal: 12-20 breaths/min</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oxygen Saturation (SpO2)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="98"
                    value={formData.oxygen_saturation}
                    onChange={(e) => setFormData({ ...formData, oxygen_saturation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Normal: 95-100%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="170.0"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    cm
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional observations..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Skip for Now
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Vital Signs'}
          </button>
        </div>
      </div>
    </div>
  );
}
