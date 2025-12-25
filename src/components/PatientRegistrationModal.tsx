import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Patient, Allergy, ChronicCondition, Medication, Surgery } from '../types';
import { createPatient, createOrUpdateMedicalHistory } from '../services/databaseService';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
  receptionistId: string;
  facilityName?: string;
}

export default function PatientRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  receptionistId,
  facilityName
}: PatientRegistrationModalProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    cnic: '',
    phone_number: '',
    email: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    city: '',
    marital_status: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [chronicConditions, setChronicConditions] = useState<ChronicCondition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [familyHistory, setFamilyHistory] = useState('');
  const [smokingStatus, setSmokingStatus] = useState('Never');
  const [alcoholConsumption, setAlcoholConsumption] = useState('None');

  const validateCNIC = (cnic: string): boolean => {
    if (!cnic) return true;
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    return cnicRegex.test(cnic);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^(\+92|0)?3\d{9}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
  };

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
      setError('Patient name is required');
      return;
    }

    if (formData.cnic && !validateCNIC(formData.cnic)) {
      setError('Invalid CNIC format. Use: XXXXX-XXXXXXX-X');
      return;
    }

    if (formData.phone_number && !validatePhone(formData.phone_number)) {
      setError('Invalid phone number format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const patientData: Partial<Patient> = {
        ...formData,
        cnic: formData.cnic || null,
        phone_number: formData.phone_number || null,
        email: formData.email || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        blood_group: formData.blood_group || null,
        address: formData.address || null,
        city: formData.city || null,
        marital_status: formData.marital_status || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
      };

      const newPatient = await createPatient(patientData, receptionistId, facilityName);

      if (allergies.length > 0 || chronicConditions.length > 0 || medications.length > 0 || surgeries.length > 0 || familyHistory) {
        await createOrUpdateMedicalHistory(newPatient.id, {
          known_allergies: allergies,
          chronic_conditions: chronicConditions,
          current_medications: medications,
          past_surgeries: surgeries,
          family_medical_history: familyHistory,
          smoking_status: smokingStatus,
          alcohol_consumption: alcoholConsumption,
        });
      }

      onSuccess(newPatient);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Register New Patient</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((section) => (
              <div
                key={section}
                className={`flex-1 h-2 rounded-full ${
                  section <= currentSection ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
          )}

          {currentSection === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNIC <span className="text-sm text-gray-500">(Optional for walk-in patients)</span>
                </label>
                <input
                  type="text"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Profile</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Known Allergies</label>
                {allergies.map((allergy, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Allergy name"
                      value={allergy.name}
                      onChange={(e) => {
                        const updated = [...allergies];
                        updated[index].name = e.target.value;
                        setAllergies(updated);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <select
                      value={allergy.severity}
                      onChange={(e) => {
                        const updated = [...allergies];
                        updated[index].severity = e.target.value as 'Mild' | 'Moderate' | 'Severe';
                        setAllergies(updated);
                      }}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                    <button
                      onClick={() => setAllergies(allergies.filter((_, i) => i !== index))}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setAllergies([...allergies, { name: '', severity: 'Mild', reaction: '' }])}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Allergy
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
                {chronicConditions.map((condition, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Condition name"
                      value={condition.name}
                      onChange={(e) => {
                        const updated = [...chronicConditions];
                        updated[index].name = e.target.value;
                        setChronicConditions(updated);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => setChronicConditions(chronicConditions.filter((_, i) => i !== index))}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setChronicConditions([...chronicConditions, { name: '', diagnosisDate: '' }])}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Condition
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                {medications.map((medication, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Medication name"
                      value={medication.name}
                      onChange={(e) => {
                        const updated = [...medications];
                        updated[index].name = e.target.value;
                        setMedications(updated);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={medication.dosage}
                      onChange={(e) => {
                        const updated = [...medications];
                        updated[index].dosage = e.target.value;
                        setMedications(updated);
                      }}
                      className="w-32 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => setMedications(medications.filter((_, i) => i !== index))}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setMedications([...medications, { name: '', dosage: '', frequency: '', startDate: '' }])}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Medication
                </button>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Medical History</label>
                <textarea
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                  placeholder="Any relevant family medical history..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Smoking Status</label>
                  <select
                    value={smokingStatus}
                    onChange={(e) => setSmokingStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Never">Never</option>
                    <option value="Former">Former</option>
                    <option value="Current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Consumption</label>
                  <select
                    value={alcoholConsumption}
                    onChange={(e) => setAlcoholConsumption(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="None">None</option>
                    <option value="Occasional">Occasional</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-between">
          <button
            onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
            disabled={currentSection === 1}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {currentSection < 4 ? (
              <button
                onClick={() => setCurrentSection(currentSection + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
