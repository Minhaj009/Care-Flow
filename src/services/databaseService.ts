import { supabase } from '../lib/supabase';
import { ExtractedPatientData, PatientVisit } from '../types';

export const savePatientVisit = async (
  transcript: string,
  extractedData: ExtractedPatientData
): Promise<PatientVisit> => {
  const { data, error } = await supabase
    .from('patient_visits')
    .insert({
      raw_transcript: transcript,
      patient_data: {
        patient_name: extractedData.patient_name,
        age: extractedData.age,
      },
      symptoms_data: {
        symptoms: extractedData.symptoms,
        duration: extractedData.duration,
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save patient visit: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after saving patient visit');
  }

  return data as PatientVisit;
};

export const getRecentVisits = async (limit: number = 10): Promise<PatientVisit[]> => {
  const { data, error } = await supabase
    .from('patient_visits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent visits: ${error.message}`);
  }

  return (data as PatientVisit[]) || [];
};
