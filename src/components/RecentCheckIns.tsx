import { PatientVisit } from '../types';
import { Clock, User, Activity, FileText, Sparkles } from 'lucide-react';

interface RecentCheckInsProps {
  visits: PatientVisit[];
  isLoading: boolean;
}

export const RecentCheckIns = ({ visits, isLoading }: RecentCheckInsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-gray-200 text-gray-800';
    const lower = severity.toLowerCase();
    if (lower.includes('high') || lower.includes('severe')) {
      return 'bg-red-600 text-white';
    }
    if (lower.includes('medium') || lower.includes('moderate')) {
      return 'bg-yellow-500 text-black';
    }
    if (lower.includes('low') || lower.includes('mild')) {
      return 'bg-green-600 text-white';
    }
    return 'bg-gray-200 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-black mb-6">Recent Check-ins</h2>
        <div className="bg-white border-4 border-black p-8 text-center">
          <p className="text-xl text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-black mb-6">Recent Check-ins</h2>
        <div className="bg-white border-4 border-black p-8 text-center">
          <p className="text-xl text-black">No check-ins yet. Start by recording your first patient check-in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-black mb-6">Recent Check-ins</h2>
      <div className="space-y-6">
        {visits.map((visit) => (
          <div key={visit.id} className="bg-white border-4 border-black overflow-hidden">
            <div className="grid md:grid-cols-2 divide-x-4 divide-black">
              <div className="bg-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Raw Voice Input</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "{visit.raw_transcript}"
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(visit.created_at)}</span>
                </div>
              </div>

              <div className="bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-black" />
                  <h4 className="text-sm font-bold text-black uppercase tracking-wide">AI Extracted Data</h4>
                </div>

                {visit.patient_data ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-6 h-6 text-black" />
                        <div>
                          <h3 className="text-2xl font-bold text-black">
                            {visit.patient_data.name || 'Name Not Captured'}
                          </h3>
                          <div className="flex gap-3 text-base text-gray-700">
                            {visit.patient_data.age && <span>Age: {visit.patient_data.age}</span>}
                            {visit.patient_data.gender && <span>• {visit.patient_data.gender}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {visit.symptoms_data?.primary_symptom && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-black" />
                          <h5 className="text-sm font-bold text-black uppercase">Symptom</h5>
                        </div>
                        <p className="text-lg font-bold text-black ml-7">
                          {visit.symptoms_data.primary_symptom}
                        </p>
                        <div className="flex gap-2 mt-2 ml-7">
                          {visit.symptoms_data.severity && (
                            <span className={`px-3 py-1 text-sm font-bold border-2 border-black ${getSeverityColor(visit.symptoms_data.severity)}`}>
                              {visit.symptoms_data.severity}
                            </span>
                          )}
                          {visit.symptoms_data.duration && (
                            <span className="px-3 py-1 text-sm font-bold border-2 border-black bg-blue-100 text-blue-900">
                              {visit.symptoms_data.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {visit.symptoms_data?.additional_notes && (
                      <div className="ml-7 text-sm text-gray-700">
                        <span className="font-bold">Notes:</span> {visit.symptoms_data.additional_notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No patient data extracted
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
