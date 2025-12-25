import { PatientVisit } from '../types';
import { Clock, User, Activity } from 'lucide-react';

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
      <div className="space-y-4">
        {visits.map((visit) => (
          <div key={visit.id} className="bg-white border-4 border-black p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-black" />
                <div>
                  <h3 className="text-2xl font-bold text-black">
                    {visit.patient_data?.name || 'Name Not Captured'}
                  </h3>
                  <div className="flex gap-4 text-lg text-black">
                    {visit.patient_data?.age && <span>Age: {visit.patient_data.age}</span>}
                    {visit.patient_data?.gender && <span>Gender: {visit.patient_data.gender}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-black">
                <Clock className="w-6 h-6" />
                <span className="text-lg">{formatDate(visit.created_at)}</span>
              </div>
            </div>

            {visit.symptoms_data?.primary_symptom && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-6 h-6 text-black" />
                  <h4 className="text-xl font-bold text-black">Primary Symptom:</h4>
                </div>
                <p className="text-lg text-black pl-8">{visit.symptoms_data.primary_symptom}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              {visit.symptoms_data?.duration && (
                <div>
                  <p className="text-lg text-black">
                    <span className="font-bold">Duration:</span> {visit.symptoms_data.duration}
                  </p>
                </div>
              )}
              {visit.symptoms_data?.severity && (
                <div>
                  <p className="text-lg text-black">
                    <span className="font-bold">Severity:</span> {visit.symptoms_data.severity}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-black">
              <p className="text-lg font-bold text-black mb-2">Transcript:</p>
              <p className="text-lg text-black leading-relaxed">{visit.raw_transcript}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
