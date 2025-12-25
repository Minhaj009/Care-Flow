import { useState } from 'react';
import { X, FileText, ClipboardList, Stethoscope, Brain, ListChecks } from 'lucide-react';
import { EncounterNote, Patient } from '../types';

interface EncounterNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EncounterNote>) => Promise<void>;
  patient: Patient;
  editingNote?: EncounterNote | null;
}

const ENCOUNTER_TYPES = [
  'General Check-up',
  'Follow-up Visit',
  'Acute Illness',
  'Chronic Disease Management',
  'Preventive Care',
  'Procedure'
];

const TEMPLATES: Record<string, Partial<EncounterNote>> = {
  'General Check-up': {
    subjective: 'Patient presents for routine check-up.\n\nHistory of Present Illness:\n\n\nReview of Systems:\n- Constitutional: \n- Cardiovascular: \n- Respiratory: \n- GI: \n- Musculoskeletal: ',
    objective: 'Vital Signs:\n- BP: \n- HR: \n- Temp: \n- RR: \n- SpO2: \n- Weight: \n\nGeneral: Alert and oriented, in no acute distress\n\nPhysical Exam:\n- HEENT: \n- Cardiovascular: \n- Lungs: \n- Abdomen: \n- Extremities: ',
    assessment: 'Assessment:\n1. ',
    plan: 'Plan:\n1. \n\nFollow-up: '
  },
  'Follow-up Visit': {
    subjective: 'Patient returns for follow-up of:\n\nInterval History:\n\nCurrent Medications:\n\nMedication Compliance: ',
    objective: 'Vital Signs:\n- BP: \n- HR: \n\nPhysical Exam:\nFocused exam of: ',
    assessment: 'Assessment:\n1. [Condition] - [Status: improving/stable/worsening]',
    plan: 'Plan:\n1. Continue current medications\n2. \n\nReturn: '
  },
  'Acute Illness': {
    subjective: 'Chief Complaint:\n\nHistory of Present Illness:\n- Onset: \n- Duration: \n- Location: \n- Character: \n- Associated symptoms: \n- Relieving factors: \n- Aggravating factors: \n\nPertinent negatives: ',
    objective: 'Vital Signs:\n- BP: \n- HR: \n- Temp: \n- RR: \n- SpO2: \n\nGeneral: \n\nFocused Physical Exam: ',
    assessment: 'Assessment:\n1. ',
    plan: 'Plan:\n1. \n\nReturn precautions: Return if symptoms worsen or do not improve in ___ days'
  },
  'Chronic Disease Management': {
    subjective: 'Chronic Condition(s) being managed:\n\nCurrent symptoms/control:\n\nMedication list and compliance:\n\nRecent test results:\n\nLifestyle factors:\n- Diet: \n- Exercise: \n- Smoking: ',
    objective: 'Vital Signs:\n- BP: \n- HR: \n- Weight: \n\nRelevant Physical Exam: ',
    assessment: 'Assessment:\n1. [Condition] - [Control status: well-controlled/suboptimally controlled/uncontrolled]\n   - Last A1c/relevant lab: \n   - Current therapy: ',
    plan: 'Plan:\n1. Medication adjustments: \n2. Labs to order: \n3. Lifestyle modifications: \n4. Referrals: \n\nFollow-up: '
  },
  'Preventive Care': {
    subjective: 'Preventive care visit\n\nHealth maintenance history:\n\nFamily history review:\n\nSocial history:\n- Tobacco: \n- Alcohol: \n- Diet/Exercise: \n\nCurrent medications: ',
    objective: 'Vital Signs:\n- BP: \n- HR: \n- Weight: \n- BMI: \n\nComplete Physical Exam:\n- General: \n- HEENT: \n- Neck: \n- Cardiovascular: \n- Lungs: \n- Abdomen: \n- Skin: ',
    assessment: 'Assessment:\n1. Health maintenance - Age-appropriate screening',
    plan: 'Preventive Care Plan:\n1. Screenings ordered: \n2. Immunizations: \n3. Counseling provided: \n4. Follow-up recommended: '
  }
};

export const EncounterNoteModal = ({
  isOpen,
  onClose,
  onSave,
  patient,
  editingNote
}: EncounterNoteModalProps) => {
  const [formData, setFormData] = useState<Partial<EncounterNote>>(
    editingNote || {
      encounter_type: 'General Check-up',
      encounter_date: new Date().toISOString().slice(0, 16),
      chief_complaint: '',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      follow_up_instructions: ''
    }
  );
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'S' | 'O' | 'A' | 'P'>('S');

  const handleApplyTemplate = (encounterType: string) => {
    const template = TEMPLATES[encounterType];
    if (template) {
      setFormData({
        ...formData,
        encounter_type: encounterType,
        subjective: formData.subjective || template.subjective,
        objective: formData.objective || template.objective,
        assessment: formData.assessment || template.assessment,
        plan: formData.plan || template.plan
      });
    } else {
      setFormData({ ...formData, encounter_type: encounterType });
    }
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

  const sections = [
    { key: 'S' as const, label: 'Subjective', icon: ClipboardList, color: 'blue' },
    { key: 'O' as const, label: 'Objective', icon: Stethoscope, color: 'green' },
    { key: 'A' as const, label: 'Assessment', icon: Brain, color: 'yellow' },
    { key: 'P' as const, label: 'Plan', icon: ListChecks, color: 'orange' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingNote ? 'Edit Encounter Note' : 'New Encounter Note'}
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

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encounter Type *
                </label>
                <select
                  value={formData.encounter_type || ''}
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  {ENCOUNTER_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encounter Date/Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.encounter_date || ''}
                  onChange={(e) => setFormData({ ...formData, encounter_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chief Complaint *
                </label>
                <input
                  type="text"
                  value={formData.chief_complaint || ''}
                  onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Chest pain, Follow-up"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex border-b border-gray-200 flex-shrink-0">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeSection === section.key
                    ? `bg-${section.color}-50 text-${section.color}-700 border-b-2 border-${section.color}-600`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: activeSection === section.key ? `var(--${section.color}-50, #f0f9ff)` : undefined,
                  borderBottomColor: activeSection === section.key ? `var(--${section.color}-600, #2563eb)` : undefined
                }}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'S' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-800">Subjective</h3>
                  <span className="text-sm text-gray-500">Patient's symptoms and history</span>
                </div>
                <textarea
                  value={formData.subjective || ''}
                  onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter subjective findings..."
                />
              </div>
            )}

            {activeSection === 'O' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-800">Objective</h3>
                  <span className="text-sm text-gray-500">Physical exam and vital signs</span>
                </div>
                <textarea
                  value={formData.objective || ''}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  placeholder="Enter objective findings..."
                />
              </div>
            )}

            {activeSection === 'A' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-yellow-800">Assessment</h3>
                  <span className="text-sm text-gray-500">Diagnoses and clinical impressions</span>
                </div>
                <textarea
                  value={formData.assessment || ''}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono text-sm"
                  placeholder="Enter assessment..."
                />
              </div>
            )}

            {activeSection === 'P' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-orange-800">Plan</h3>
                  <span className="text-sm text-gray-500">Treatment plan and follow-up</span>
                </div>
                <textarea
                  value={formData.plan || ''}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  placeholder="Enter treatment plan..."
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Instructions
                  </label>
                  <textarea
                    value={formData.follow_up_instructions || ''}
                    onChange={(e) => setFormData({ ...formData, follow_up_instructions: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Instructions for patient follow-up..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex gap-2">
              {sections.map((section, index) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    activeSection === section.key
                      ? 'bg-emerald-600 text-white'
                      : formData[section.key.toLowerCase() === 's' ? 'subjective' :
                               section.key.toLowerCase() === 'o' ? 'objective' :
                               section.key.toLowerCase() === 'a' ? 'assessment' : 'plan']
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {section.key}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
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
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    {editingNote ? 'Update Note' : 'Save as Draft'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
