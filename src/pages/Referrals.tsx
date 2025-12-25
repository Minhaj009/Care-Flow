import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Share2,
  Plus,
  Search,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import { ReferralModal } from '../components/ReferralModal';
import PatientSearchModal from '../components/PatientSearchModal';
import { getAllReferrals, createReferral, updateReferral } from '../services/ehrService';
import { supabase } from '../lib/supabase';
import { Referral, Patient } from '../types';

type StatusFilter = 'all' | 'pending' | 'sent' | 'scheduled' | 'seen' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Sent': 'bg-blue-100 text-blue-800',
  'Scheduled': 'bg-cyan-100 text-cyan-800',
  'Seen': 'bg-teal-100 text-teal-800',
  'Report Received': 'bg-green-100 text-green-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

const PRIORITY_COLORS: Record<string, string> = {
  'Routine': 'bg-gray-100 text-gray-800',
  'Urgent': 'bg-orange-100 text-orange-800',
  'Emergency': 'bg-red-100 text-red-800'
};

export const Referrals = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedReferral, setExpandedReferral] = useState<string | null>(null);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState<string | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      const data = await getAllReferrals();
      setReferrals(data);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setShowModal(true);
  };

  const handleSaveReferral = async (data: Partial<Referral>) => {
    try {
      if (editingReferral) {
        await updateReferral(editingReferral.id, data);
        setSuccessMessage('Referral updated successfully!');
      } else {
        await createReferral({
          ...data,
          patient_id: selectedPatient?.id,
          referring_provider_id: userId || ''
        });
        setSuccessMessage('Referral created successfully!');
      }
      setShowModal(false);
      setEditingReferral(null);
      setSelectedPatient(null);
      setTimeout(() => setSuccessMessage(null), 5000);
      loadData();
    } catch (error) {
      console.error('Error saving referral:', error);
    }
  };

  const handleUpdateStatus = async (referralId: string, newStatus: string) => {
    try {
      const referral = referrals.find(r => r.id === referralId);
      const statusHistory = referral?.status_history || [];
      statusHistory.push({
        status: newStatus,
        date: new Date().toISOString(),
        notes: statusUpdateNote
      });

      await updateReferral(referralId, {
        status: newStatus as any,
        status_history: statusHistory,
        notes: statusUpdateNote || referral?.notes
      });
      setShowStatusUpdate(null);
      setStatusUpdateNote('');
      setSuccessMessage('Referral status updated!');
      setTimeout(() => setSuccessMessage(null), 5000);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    if (statusFilter !== 'all' && ref.status?.toLowerCase() !== statusFilter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = ref.patient?.full_name?.toLowerCase() || '';
      const specialty = ref.referred_to_specialty?.toLowerCase() || '';
      const facility = ref.referred_to_facility?.toLowerCase() || '';
      if (!patientName.includes(query) && !specialty.includes(query) && !facility.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Sent':
        return <Share2 className="w-4 h-4" />;
      case 'Scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'Completed':
      case 'Report Received':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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
              <Share2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
                <p className="text-gray-600">Manage specialist referrals and track status</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPatientSearch(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Referral
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Referrals</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient, specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'sent', 'scheduled', 'seen', 'completed', 'cancelled'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading referrals...</p>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No referrals found</p>
              </div>
            ) : (
              filteredReferrals.map((ref) => (
                <div key={ref.id} className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedReferral(expandedReferral === ref.id ? null : ref.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{ref.patient?.full_name || 'Unknown Patient'}</p>
                        <p className="text-sm text-gray-600">
                          {ref.referred_to_specialty}
                          {ref.referred_to_facility && ` at ${ref.referred_to_facility}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[ref.priority] || 'bg-gray-100'}`}>
                        {ref.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[ref.status] || 'bg-gray-100'}`}>
                        {getStatusIcon(ref.status)}
                        {ref.status}
                      </span>
                      <p className="text-sm text-gray-600">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </p>
                      {expandedReferral === ref.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedReferral === ref.id && (
                    <div className="mt-4 ml-14 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Referral Type</p>
                          <p className="text-gray-900">{ref.referral_type || 'Consultation'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Requested Timeframe</p>
                          <p className="text-gray-900">{ref.requested_timeframe || 'Not specified'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Reason for Referral</p>
                          <p className="text-gray-900">{ref.reason_for_referral}</p>
                        </div>
                        {ref.clinical_information && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-500">Clinical Information</p>
                            <p className="text-gray-900">{ref.clinical_information}</p>
                          </div>
                        )}
                        {ref.appointment_date && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Appointment Date</p>
                            <p className="text-gray-900">{new Date(ref.appointment_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {showStatusUpdate === ref.id ? (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {['Sent', 'Scheduled', 'Seen', 'Report Received', 'Completed', 'Cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateStatus(ref.id, status)}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]} hover:opacity-80`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={statusUpdateNote}
                            onChange={(e) => setStatusUpdateNote(e.target.value)}
                            placeholder="Add a note (optional)..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => setShowStatusUpdate(null)}
                            className="mt-2 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowStatusUpdate(ref.id);
                            }}
                            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingReferral(ref);
                              setShowModal(true);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Edit Details
                          </button>
                        </div>
                      )}

                      {ref.status_history && ref.status_history.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Status History</p>
                          <div className="space-y-2">
                            {ref.status_history.map((history: any, index: number) => (
                              <div key={index} className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                                <div>
                                  <span className="font-medium">{history.status}</span>
                                  <span className="text-gray-500 mx-2">-</span>
                                  <span className="text-gray-600">{new Date(history.date).toLocaleString()}</span>
                                  {history.notes && <p className="text-gray-600 mt-1">{history.notes}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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

      {(showModal && selectedPatient) || editingReferral ? (
        <ReferralModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingReferral(null);
            setSelectedPatient(null);
          }}
          onSave={handleSaveReferral}
          patient={selectedPatient || editingReferral?.patient as Patient}
          editingReferral={editingReferral}
        />
      ) : null}
    </div>
  );
};
