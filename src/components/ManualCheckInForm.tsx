import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Patient, Symptom, PatientMedicalHistory } from '../types';

interface ManualCheckInFormProps {
  onSubmit: (patientData: any, symptoms: Symptom[], notes: string) => void;
  isProcessing: boolean;
  selectedPatient: Patient;
  patientHistory: PatientMedicalHistory | null;
}

export const ManualCheckInForm = ({
  onSubmit,
  isProcessing,
  selectedPatient,
  patientHistory
}: ManualCheckInFormProps) => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([{ name: '', duration: '', severity: 'Mild' }]);
  const [notes, setNotes] = useState('');

  const handleAddSymptom = () => {
    setSymptoms([...symptoms, { name: '', duration: '', severity: 'Mild' }]);
  };

  const handleRemoveSymptom = (index: number) => {
    if (symptoms.length > 1) {
      setSymptoms(symptoms.filter((_, i) => i !== index));
    }
  };

  const handleSymptomChange = (index: number, field: keyof Symptom, value: string) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = { ...newSymptoms[index], [field]: value };
    setSymptoms(newSymptoms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredSymptoms = symptoms.filter(s => s.name.trim() !== '');

    if (filteredSymptoms.length === 0) {
      alert('Please add at least one symptom');
      return;
    }

    const patientData = {
      name: selectedPatient.full_name,
      age: selectedPatient.date_of_birth
        ? Math.floor((Date.now() - new Date(selectedPatient.date_of_birth).getTime()) / 31557600000).toString()
        : null,
      gender: selectedPatient.gender
    };

    onSubmit(patientData, filteredSymptoms, notes);

    setSymptoms([{ name: '', duration: '', severity: 'Mild' }]);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {patientHistory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Patient Medical Context</h4>
          <div className="text-sm text-blue-800 space-y-1">
            {patientHistory.known_allergies && patientHistory.known_allergies.length > 0 && (
              <p>
                <span className="font-semibold">Allergies:</span>{' '}
                {patientHistory.known_allergies.map(a => a.name).join(', ')}
              </p>
            )}
            {patientHistory.chronic_conditions && patientHistory.chronic_conditions.length > 0 && (
              <p>
                <span className="font-semibold">Chronic Conditions:</span>{' '}
                {patientHistory.chronic_conditions.map(c => c.name).join(', ')}
              </p>
            )}
            {patientHistory.current_medications && patientHistory.current_medications.length > 0 && (
              <p>
                <span className="font-semibold">Current Medications:</span>{' '}
                {patientHistory.current_medications.map(m => m.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddSymptom}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Symptom
            </button>
          </div>

          <div className="space-y-3">
            {symptoms.map((symptom, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Symptom Name
                    </label>
                    <input
                      type="text"
                      value={symptom.name}
                      onChange={(e) => handleSymptomChange(index, 'name', e.target.value)}
                      placeholder="e.g., Headache, Fever, Cough"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={symptom.duration || ''}
                      onChange={(e) => handleSymptomChange(index, 'duration', e.target.value)}
                      placeholder="e.g., 2 days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Severity
                    </label>
                    <select
                      value={symptom.severity || 'Mild'}
                      onChange={(e) => handleSymptomChange(index, 'severity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    {symptoms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSymptom(index)}
                        className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove symptom"
                      >
                        <Trash2 className="w-5 h-5 mx-auto" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations, patient concerns, or relevant information..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Check-In
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
