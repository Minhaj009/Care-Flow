import { Mic, Square, AlertTriangle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Patient, PatientMedicalHistory } from '../types';

interface RecordingInterfaceProps {
  onTranscriptComplete: (transcript: string) => void;
  isProcessing: boolean;
  selectedPatient?: Patient;
  patientHistory?: PatientMedicalHistory | null;
}

export const RecordingInterface = ({
  onTranscriptComplete,
  isProcessing,
  selectedPatient,
  patientHistory
}: RecordingInterfaceProps) => {
  const { isRecording, transcript, interimTranscript, isSupported, error, startRecording, stopRecording } =
    useSpeechRecognition();

  const calculateAge = (dob: string | null): string => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
      if (transcript.trim()) {
        console.log("=== RECORDING STOPPED ===");
        console.log("Final Transcript:", transcript.trim());
        onTranscriptComplete(transcript.trim());
      } else {
        console.log("No transcript captured");
      }
    } else {
      console.log("=== RECORDING STARTED ===");
      startRecording();
    }
  };

  const displayTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white border-4 border-black p-8 text-center">
          <p className="text-xl font-bold text-black">
            Speech recognition is not supported in this browser.
          </p>
          <p className="text-lg text-black mt-4">Please use Chrome, Edge, or Safari.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {selectedPatient && (
        <div className="mb-6 p-6 bg-white border-4 border-black">
          <h3 className="text-xl font-bold text-black mb-4">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold">{selectedPatient.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="text-lg font-semibold">{calculateAge(selectedPatient.date_of_birth)}</p>
            </div>
            {selectedPatient.cnic ? (
              <div>
                <p className="text-sm text-gray-600">CNIC</p>
                <p className="text-lg font-semibold">{selectedPatient.cnic}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">Patient Type</p>
                <p className="text-lg font-semibold text-yellow-600">Walk-in</p>
              </div>
            )}
            {selectedPatient.phone_number && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-lg font-semibold">{selectedPatient.phone_number}</p>
              </div>
            )}
          </div>

          {patientHistory && patientHistory.known_allergies && patientHistory.known_allergies.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="font-bold text-red-900">Known Allergies</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {patientHistory.known_allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      allergy.severity === 'Severe'
                        ? 'bg-red-600 text-white'
                        : allergy.severity === 'Moderate'
                        ? 'bg-orange-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}
                  >
                    {allergy.name} ({allergy.severity})
                  </span>
                ))}
              </div>
            </div>
          )}

          {patientHistory && patientHistory.chronic_conditions && patientHistory.chronic_conditions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Chronic Conditions</p>
              <div className="flex flex-wrap gap-2">
                {patientHistory.chronic_conditions.map((condition, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {condition.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleButtonClick}
        disabled={isProcessing}
        className={`w-full h-32 text-2xl font-bold border-4 border-black transition-colors ${
          isRecording
            ? 'bg-black text-white'
            : isProcessing
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-white text-black hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center justify-center gap-4">
          {isRecording ? (
            <>
              <Square className="w-12 h-12" fill="currentColor" />
              <span>Stop Recording</span>
            </>
          ) : isProcessing ? (
            <span>Processing...</span>
          ) : (
            <>
              <Mic className="w-12 h-12" />
              <span>Record Patient Check-in</span>
            </>
          )}
        </div>
      </button>

      {isRecording && (
        <div className="mt-6 p-4 bg-black text-white border-4 border-black">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
            <span className="text-lg font-bold">RECORDING...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-6 bg-white border-4 border-black">
          <p className="text-lg font-bold text-black">{error}</p>
        </div>
      )}

      {displayTranscript && (
        <div className="mt-6 p-6 bg-white border-4 border-black">
          <h3 className="text-xl font-bold text-black mb-4">Transcript:</h3>
          <p className="text-lg text-black whitespace-pre-wrap leading-relaxed">{displayTranscript}</p>
        </div>
      )}
    </div>
  );
};
