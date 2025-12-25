export interface ExtractedPatientData {
  patient_name: string | null;
  age: string | null;
  symptoms: string[] | null;
  duration: string | null;
}

export interface Symptom {
  name: string;
  duration?: string | null;
  severity?: string;
}

export interface PatientVisit {
  id: string;
  created_at: string;
  raw_transcript: string;
  patient_data: {
    name?: string | null;
    patient_name?: string | null;
    age?: string | null;
    gender?: string | null;
  };
  symptoms_data: Symptom[];
}

export interface RecordingState {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
}
