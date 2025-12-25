import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  User,
  Clock,
  CheckCircle,
  Lock,
  ArrowLeft,
  Calendar,
  Edit3,
  Eye
} from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import { EncounterNoteModal } from '../components/EncounterNoteModal';
import PatientSearchModal from '../components/PatientSearchModal';
import { getAllEncounterNotes, createEncounterNote, updateEncounterNote, signEncounterNote } from '../services/ehrService';
import { supabase } from '../lib/supabase';
import { EncounterNote, Patient } from '../types';

type StatusFilter = 'all' | 'draft' | 'signed';

const STATUS_COLORS: Record<string, string> = {
  'Draft': 'bg-yellow-100 text-yellow-800',
  'Signed': 'bg-green-100 text-green-800',
  'Addendum': 'bg-blue-100 text-blue-800'
};

const ENCOUNTER_TYPE_COLORS: Record<string, string> = {
  'General Check-up': 'bg-blue-100 text-blue-800',
  'Follow-up Visit': 'bg-cyan-100 text-cyan-800',
  'Acute Illness': 'bg-orange-100 text-orange-800',
  'Chronic Disease Management': 'bg-teal-100 text-teal-800',
  'Preventive Care': 'bg-green-100 text-green-800',
  'Procedure': 'bg-gray-100 text-gray-800'
};

export const EncounterNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<EncounterNote | null>(null);
  const [viewingNote, setViewingNote] = useState<EncounterNote | null>(null);

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
      const data = await getAllEncounterNotes();
      setNotes(data);
    } catch (error) {
      console.error('Error loading encounter notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setShowModal(true);
  };

  const handleSaveNote = async (data: Partial<EncounterNote>) => {
    try {
      if (editingNote) {
        await updateEncounterNote(editingNote.id, data);
        setSuccessMessage('Encounter note updated!');
      } else {
        await createEncounterNote({
          ...data,
          patient_id: selectedPatient?.id,
          provider_id: userId || '',
          status: 'Draft',
          is_signed: false
        });
        setSuccessMessage('Encounter note created!');
      }
      setShowModal(false);
      setEditingNote(null);
      setSelectedPatient(null);
      setTimeout(() => setSuccessMessage(null), 5000);
      loadData();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleSignNote = async (noteId: string) => {
    if (!userId) return;
    try {
      await signEncounterNote(noteId, userId);
      setSuccessMessage('Encounter note signed and locked!');
      setTimeout(() => setSuccessMessage(null), 5000);
      loadData();
    } catch (error) {
      console.error('Error signing note:', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    if (statusFilter === 'draft' && note.is_signed) return false;
    if (statusFilter === 'signed' && !note.is_signed) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = note.patient?.full_name?.toLowerCase() || '';
      const chiefComplaint = note.chief_complaint?.toLowerCase() || '';
      if (!patientName.includes(query) && !chiefComplaint.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const unsignedCount = notes.filter(n => !n.is_signed).length;

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
              <FileText className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Encounter Notes</h1>
                <p className="text-gray-600">Document patient encounters with SOAP format</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {unsignedCount > 0 && (
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{unsignedCount} unsigned notes</span>
              </div>
            )}
            <button
              onClick={() => setShowPatientSearch(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Encounter Note
            </button>
          </div>
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
              <h3 className="text-lg font-semibold text-gray-900">All Encounter Notes</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient or complaint..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {(['all', 'draft', 'signed'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'draft' && unsignedCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-900 rounded-full text-xs">
                      {unsignedCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading encounter notes...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No encounter notes found</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        note.is_signed ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {note.is_signed ? (
                          <Lock className="w-5 h-5 text-green-600" />
                        ) : (
                          <Edit3 className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{note.patient?.full_name || 'Unknown Patient'}</p>
                        <p className="text-sm text-gray-600">
                          {note.chief_complaint || 'No chief complaint'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ENCOUNTER_TYPE_COLORS[note.encounter_type] || 'bg-gray-100'}`}>
                        {note.encounter_type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[note.status || (note.is_signed ? 'Signed' : 'Draft')]}`}>
                        {note.is_signed ? 'Signed' : 'Draft'}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(note.encounter_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(note.encounter_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingNote(note)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="View Note"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!note.is_signed && (
                          <>
                            <button
                              onClick={() => {
                                setEditingNote(note);
                                setShowModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                              title="Edit Note"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSignNote(note.id)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                            >
                              Sign
                            </button>
                          </>
                        )}
                      </div>
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

      {(showModal && selectedPatient) || editingNote ? (
        <EncounterNoteModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingNote(null);
            setSelectedPatient(null);
          }}
          onSave={handleSaveNote}
          patient={selectedPatient || editingNote?.patient as Patient}
          editingNote={editingNote}
        />
      ) : null}

      {viewingNote && (
        <NoteViewModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}
    </div>
  );
};

const NoteViewModal = ({ note, onClose }: { note: EncounterNote; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              note.is_signed ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {note.is_signed ? (
                <Lock className="w-5 h-5 text-green-600" />
              ) : (
                <FileText className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Encounter Note</h2>
              <p className="text-sm text-gray-600">
                {note.patient?.full_name} - {new Date(note.encounter_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${ENCOUNTER_TYPE_COLORS[note.encounter_type] || 'bg-gray-100'}`}>
              {note.encounter_type}
            </span>
            {note.is_signed && (
              <span className="text-sm text-green-700 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Signed on {note.signed_at ? new Date(note.signed_at).toLocaleString() : 'N/A'}
              </span>
            )}
          </div>

          {note.chief_complaint && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Chief Complaint</h3>
              <p className="text-gray-900">{note.chief_complaint}</p>
            </div>
          )}

          {note.subjective && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">Subjective</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{note.subjective}</p>
            </div>
          )}

          {note.objective && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-2">Objective</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{note.objective}</p>
            </div>
          )}

          {note.assessment && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-2">Assessment</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{note.assessment}</p>
            </div>
          )}

          {note.plan && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-wider mb-2">Plan</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{note.plan}</p>
            </div>
          )}

          {note.follow_up_instructions && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Follow-up Instructions</h3>
              <p className="text-gray-900">{note.follow_up_instructions}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
