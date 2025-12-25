import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { PatientVisit, Symptom } from '../types';

interface EditPatientVisitModalProps {
  visit: PatientVisit;
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitId: string, transcript: string, patientData: any, symptomsData: Symptom[]) => Promise<void>;
}

export const EditPatientVisitModal = ({ visit, isOpen, onClose, onSave }: EditPatientVisitModalProps) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && visit) {
      setName(visit.patient_data?.name || visit.patient_data?.patient_name || '');
      setAge(visit.patient_data?.age || '');
      setGender(visit.patient_data?.gender || '');
      setSymptoms(Array.isArray(visit.symptoms_data) ? [...visit.symptoms_data] : []);
      setError(null);
    }
  }, [isOpen, visit]);

  const handleAddSymptom = () => {
    setSymptoms([...symptoms, { name: '', duration: '', severity: 'Mild' }]);
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleSymptomChange = (index: number, field: keyof Symptom, value: string) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = { ...newSymptoms[index], [field]: value };
    setSymptoms(newSymptoms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Patient name is required');
      return;
    }

    const validSymptoms = symptoms.filter(s => s.name.trim() !== '');

    setIsSaving(true);
    try {
      const patientData = {
        name: name.trim(),
        age: age.trim() || null,
        gender: gender.trim() || null,
      };

      await onSave(visit.id, visit.raw_transcript, patientData, validSymptoms);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Edit Patient Visit</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Original Transcript (Reference Only)
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 italic max-h-24 overflow-y-auto">
                  "{visit.raw_transcript}"
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="text-lg font-semibold text-slate-900">Patient Information</h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Age
                    </label>
                    <input
                      type="text"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 35"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-900">Symptoms</h4>
                  <button
                    type="button"
                    onClick={handleAddSymptom}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Symptom
                  </button>
                </div>

                {symptoms.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No symptoms added yet</p>
                ) : (
                  <div className="space-y-3">
                    {symptoms.map((symptom, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <input
                            type="text"
                            value={symptom.name}
                            onChange={(e) => handleSymptomChange(index, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Symptom name"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSymptom(index)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Duration
                            </label>
                            <input
                              type="text"
                              value={symptom.duration || ''}
                              onChange={(e) => handleSymptomChange(index, 'duration', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., 3 days"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Severity
                            </label>
                            <select
                              value={symptom.severity || 'Mild'}
                              onChange={(e) => handleSymptomChange(index, 'severity', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Mild">Mild</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Severe">Severe</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
