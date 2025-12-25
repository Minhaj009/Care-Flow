import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Plus,
  Search,
  User,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Eye,
  Check
} from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import { LabResultModal } from '../components/LabResultModal';
import PatientSearchModal from '../components/PatientSearchModal';
import { getLabResults, createLabResult, reviewLabResult, getLabResultTrends } from '../services/ehrService';
import { supabase } from '../lib/supabase';
import { LabResult, Patient } from '../types';

type FilterTab = 'all' | 'abnormal' | 'pending' | 'reviewed';

const INTERPRETATION_COLORS: Record<string, string> = {
  'Normal': 'bg-green-100 text-green-800',
  'Abnormal Low': 'bg-orange-100 text-orange-800',
  'Abnormal High': 'bg-orange-100 text-orange-800',
  'Critical Low': 'bg-red-100 text-red-800',
  'Critical High': 'bg-red-100 text-red-800',
  'Pending': 'bg-gray-100 text-gray-800'
};

const CATEGORY_COLORS: Record<string, string> = {
  'Chemistry': 'bg-blue-100 text-blue-800',
  'Hematology': 'bg-red-100 text-red-800',
  'Urinalysis': 'bg-yellow-100 text-yellow-800',
  'Microbiology': 'bg-green-100 text-green-800',
  'Immunology': 'bg-teal-100 text-teal-800',
  'Coagulation': 'bg-orange-100 text-orange-800',
  'Endocrine': 'bg-cyan-100 text-cyan-800',
  'Other': 'bg-gray-100 text-gray-800'
};

export const LabResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [showTrends, setShowTrends] = useState<{ patientId: string; testName: string } | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);

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
      const data = await getLabResults();
      setResults(data);
    } catch (error) {
      console.error('Error loading lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setShowModal(true);
  };

  const handleSaveResult = async (data: Partial<LabResult>) => {
    try {
      await createLabResult({
        ...data,
        patient_id: selectedPatient?.id
      });
      setShowModal(false);
      setSelectedPatient(null);
      setSuccessMessage('Lab result recorded successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      loadData();
    } catch (error) {
      console.error('Error saving lab result:', error);
    }
  };

  const handleReviewResult = async (resultId: string) => {
    if (!userId) return;
    try {
      await reviewLabResult(resultId, userId);
      setSuccessMessage('Lab result marked as reviewed!');
      setTimeout(() => setSuccessMessage(null), 5000);
      loadData();
    } catch (error) {
      console.error('Error reviewing result:', error);
    }
  };

  const handleShowTrends = async (patientId: string, testName: string) => {
    try {
      const data = await getLabResultTrends(patientId, testName);
      setTrendData(data);
      setShowTrends({ patientId, testName });
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  };

  const filteredResults = results.filter(result => {
    if (filterTab === 'abnormal') {
      if (!['Abnormal Low', 'Abnormal High', 'Critical Low', 'Critical High'].includes(result.interpretation)) {
        return false;
      }
    }
    if (filterTab === 'pending' && result.interpretation !== 'Pending') {
      return false;
    }
    if (filterTab === 'reviewed' && !result.is_reviewed) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = result.patient?.full_name?.toLowerCase() || '';
      const testName = result.test_name?.toLowerCase() || '';
      if (!patientName.includes(query) && !testName.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const abnormalCount = results.filter(r =>
    ['Abnormal Low', 'Abnormal High', 'Critical Low', 'Critical High'].includes(r.interpretation) && !r.is_reviewed
  ).length;

  const getInterpretationIcon = (interpretation: string) => {
    if (interpretation === 'Normal') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (interpretation.includes('Low')) {
      return <TrendingDown className="w-4 h-4 text-orange-600" />;
    }
    if (interpretation.includes('High')) {
      return <TrendingUp className="w-4 h-4 text-orange-600" />;
    }
    return null;
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
              <FlaskConical className="w-8 h-8 text-rose-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
                <p className="text-gray-600">Enter and review laboratory test results</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {abnormalCount > 0 && (
              <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">{abnormalCount} abnormal results to review</span>
              </div>
            )}
            <button
              onClick={() => setShowPatientSearch(true)}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Enter Lab Result
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
              <h3 className="text-lg font-semibold text-gray-900">All Lab Results</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient or test..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {(['all', 'abnormal', 'pending', 'reviewed'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterTab === tab
                      ? 'bg-rose-100 text-rose-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'abnormal' && abnormalCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-900 rounded-full text-xs">
                      {abnormalCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading lab results...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No lab results found</p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <div key={result.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        result.interpretation === 'Normal' ? 'bg-green-100' :
                        result.interpretation.includes('Critical') ? 'bg-red-100' :
                        result.interpretation.includes('Abnormal') ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <FlaskConical className={`w-5 h-5 ${
                          result.interpretation === 'Normal' ? 'text-green-600' :
                          result.interpretation.includes('Critical') ? 'text-red-600' :
                          result.interpretation.includes('Abnormal') ? 'text-orange-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{result.test_name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[result.test_category] || 'bg-gray-100'}`}>
                            {result.test_category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {result.patient?.full_name || 'Unknown Patient'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {result.result_value} {result.result_unit}
                          </p>
                          {getInterpretationIcon(result.interpretation)}
                        </div>
                        {result.reference_range_low && result.reference_range_high && (
                          <p className="text-xs text-gray-500">
                            Ref: {result.reference_range_low} - {result.reference_range_high} {result.result_unit}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${INTERPRETATION_COLORS[result.interpretation] || 'bg-gray-100'}`}>
                        {result.interpretation}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(result.result_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.is_reviewed ? 'Reviewed' : 'Pending review'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowTrends(result.patient_id, result.test_name)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="View Trends"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedResult(result)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!result.is_reviewed && (
                          <button
                            onClick={() => handleReviewResult(result.id)}
                            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Review
                          </button>
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

      {showModal && selectedPatient && (
        <LabResultModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedPatient(null);
          }}
          onSave={handleSaveResult}
          patient={selectedPatient}
        />
      )}

      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}

      {showTrends && (
        <TrendModal
          testName={showTrends.testName}
          data={trendData}
          onClose={() => {
            setShowTrends(null);
            setTrendData([]);
          }}
        />
      )}
    </div>
  );
};

const ResultDetailModal = ({ result, onClose }: { result: LabResult; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Lab Result Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Test Name</p>
              <p className="font-medium text-gray-900">{result.test_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium text-gray-900">{result.test_category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Result</p>
              <p className="font-medium text-gray-900">{result.result_value} {result.result_unit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reference Range</p>
              <p className="font-medium text-gray-900">
                {result.reference_range_low && result.reference_range_high
                  ? `${result.reference_range_low} - ${result.reference_range_high}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Interpretation</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${INTERPRETATION_COLORS[result.interpretation]}`}>
                {result.interpretation}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Collection Date</p>
              <p className="font-medium text-gray-900">{new Date(result.collection_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Result Date</p>
              <p className="font-medium text-gray-900">{new Date(result.result_date).toLocaleDateString()}</p>
            </div>
            {result.performing_lab && (
              <div>
                <p className="text-sm text-gray-500">Performing Lab</p>
                <p className="font-medium text-gray-900">{result.performing_lab}</p>
              </div>
            )}
          </div>
          {result.notes && (
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-gray-900">{result.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const TrendModal = ({ testName, data, onClose }: { testName: string; data: any[]; onClose: () => void }) => {
  const maxValue = Math.max(...data.map(d => parseFloat(d.result_value) || 0));
  const minValue = Math.min(...data.map(d => parseFloat(d.result_value) || 0));
  const range = maxValue - minValue || 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{testName} - Trend</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No historical data available</p>
          ) : data.length === 1 ? (
            <p className="text-center text-gray-500 py-8">Only one result available - need more data for trend</p>
          ) : (
            <div className="space-y-4">
              <div className="h-48 flex items-end gap-2">
                {data.map((point, index) => {
                  const value = parseFloat(point.result_value) || 0;
                  const height = ((value - minValue) / range) * 100 + 10;
                  const isAbnormal = point.interpretation !== 'Normal';
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-600">{point.result_value}</span>
                      <div
                        className={`w-full rounded-t-lg ${isAbnormal ? 'bg-orange-500' : 'bg-rose-500'}`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {new Date(point.result_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500 rounded"></div>
                  <span className="text-gray-600">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">Abnormal</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
