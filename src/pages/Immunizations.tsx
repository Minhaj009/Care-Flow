import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Syringe,
  Plus,
  Search,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import { ImmunizationModal } from '../components/ImmunizationModal';
import PatientSearchModal from '../components/PatientSearchModal';
import { getAllImmunizations, getImmunizations, createImmunization } from '../services/ehrService';
import { supabase } from '../lib/supabase';
import { Immunization, Patient } from '../types';

const VACCINE_SCHEDULE = [
  { name: 'Hepatitis B', ages: ['Birth', '1-2 months', '6-18 months'] },
  { name: 'DTaP', ages: ['2 months', '4 months', '6 months', '15-18 months', '4-6 years'] },
  { name: 'Hib', ages: ['2 months', '4 months', '6 months', '12-15 months'] },
  { name: 'IPV', ages: ['2 months', '4 months', '6-18 months', '4-6 years'] },
  { name: 'PCV13', ages: ['2 months', '4 months', '6 months', '12-15 months'] },
  { name: 'RV', ages: ['2 months', '4 months', '6 months'] },
  { name: 'MMR', ages: ['12-15 months', '4-6 years'] },
  { name: 'Varicella', ages: ['12-15 months', '4-6 years'] },
  { name: 'Hepatitis A', ages: ['12-23 months'] },
  { name: 'Influenza', ages: ['6 months (annually)'] },
  { name: 'COVID-19', ages: ['6 months+'] },
  { name: 'Tdap', ages: ['11-12 years'] },
  { name: 'HPV', ages: ['11-12 years'] },
  { name: 'Meningococcal', ages: ['11-12 years', '16 years'] },
];

type FilterTab = 'all' | 'due' | 'overdue' | 'uptodate';

export const Immunizations = () => {
  const navigate = useNavigate();
  const [immunizations, setImmunizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientImmunizations, setPatientImmunizations] = useState<Immunization[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientImmunizations(selectedPatient.id);
    }
  }, [selectedPatient]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      const data = await getAllImmunizations();
      setImmunizations(data);
    } catch (error) {
      console.error('Error loading immunizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientImmunizations = async (patientId: string) => {
    try {
      const data = await getImmunizations(patientId);
      setPatientImmunizations(data);
    } catch (error) {
      console.error('Error loading patient immunizations:', error);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
  };

  const handleSaveImmunization = async (data: Partial<Immunization>) => {
    try {
      await createImmunization({
        ...data,
        patient_id: selectedPatient?.id,
        administered_by: userId || ''
      });
      setShowModal(false);
      setSuccessMessage('Immunization recorded successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      if (selectedPatient) {
        loadPatientImmunizations(selectedPatient.id);
      }
      loadData();
    } catch (error) {
      console.error('Error saving immunization:', error);
    }
  };

  const filteredImmunizations = immunizations.filter(imm => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = imm.patient?.full_name?.toLowerCase() || '';
      const vaccineName = imm.vaccine_name?.toLowerCase() || '';
      if (!patientName.includes(query) && !vaccineName.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'administered':
        return 'bg-green-100 text-green-800';
      case 'due':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <Syringe className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Immunizations</h1>
                <p className="text-gray-600">Track and manage patient vaccinations</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {showSchedule ? 'Hide Schedule' : 'View Schedule'}
            </button>
            <button
              onClick={() => setShowPatientSearch(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Record Immunization
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {showSchedule && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Recommended Immunization Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VACCINE_SCHEDULE.map((vaccine, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{vaccine.name}</h4>
                  <div className="flex flex-wrap gap-1">
                    {vaccine.ages.map((age, i) => (
                      <span key={i} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                        {age}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPatient && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedPatient.full_name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedPatient.date_of_birth && `DOB: ${new Date(selectedPatient.date_of_birth).toLocaleDateString()}`}
                      {selectedPatient.cnic && ` | CNIC: ${selectedPatient.cnic}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Vaccination
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      setPatientImmunizations([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                  >
                    Change Patient
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Vaccination History</h4>
              {patientImmunizations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Syringe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No immunizations recorded for this patient</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientImmunizations.map((imm) => (
                    <div key={imm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{imm.vaccine_name}</p>
                          <p className="text-sm text-gray-600">
                            {imm.dose_number && `Dose ${imm.dose_number}`}
                            {imm.dose_series && ` of ${imm.dose_series}`}
                            {imm.lot_number && ` | Lot: ${imm.lot_number}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {new Date(imm.administered_date).toLocaleDateString()}
                        </p>
                        {imm.administration_site && (
                          <p className="text-sm text-gray-600">{imm.administration_site}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Immunizations</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient or vaccine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {(['all', 'due', 'overdue', 'uptodate'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterTab === tab
                      ? 'bg-teal-100 text-teal-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'all' && 'All'}
                  {tab === 'due' && 'Due Now'}
                  {tab === 'overdue' && 'Overdue'}
                  {tab === 'uptodate' && 'Up to Date'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading immunizations...</p>
              </div>
            ) : filteredImmunizations.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Syringe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No immunizations found</p>
              </div>
            ) : (
              filteredImmunizations.map((imm) => (
                <div key={imm.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <Syringe className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{imm.vaccine_name}</p>
                        <p className="text-sm text-gray-600">
                          {imm.patient?.full_name || 'Unknown Patient'}
                          {imm.dose_number && ` - Dose ${imm.dose_number}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {new Date(imm.administered_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {imm.lot_number && `Lot: ${imm.lot_number}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor('administered')}`}>
                        Administered
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <PatientSearchModal
        isOpen={showPatientSearch}
        onClose={() => setShowPatientSearch(false)}
        onSelectPatient={handleSelectPatient}
        onNewPatient={() => {}}
        receptionistId={userId || ''}
      />

      {selectedPatient && (
        <ImmunizationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveImmunization}
          patient={selectedPatient}
        />
      )}
    </div>
  );
};
