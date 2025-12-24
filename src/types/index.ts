export interface ExtractedPatientData {
  patient_name: string | null;
  age: string | null;
  symptoms: string[] | null;
  duration: string | null;
}

export interface PatientVisit {
  id: string;
  created_at: string;
  raw_transcript: string;
  patient_data: {
    patient_name?: string | null;
    age?: string | null;
  };
  symptoms_data: {
    symptoms?: string[] | null;
    duration?: string | null;
  };
}

export interface RecordingState {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
}
