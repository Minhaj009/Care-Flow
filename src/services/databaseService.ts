import { supabase } from '../lib/supabase';
import { ExtractedPatientData, PatientVisit } from '../types';

export const savePatientVisit = async (
  transcript: string,
  aiJson: any,
  receptionistId: string
): Promise<PatientVisit> => {
  const patientData = aiJson.patient_data || {};
  const symptomsData = aiJson.symptoms_data || [];

  console.log("Vector Protocol: Attempting to save to Supabase...", {
    raw_transcript: transcript,
    patient_data: patientData,
    symptoms_data: symptomsData,
    receptionist_id: receptionistId
  });

  const { data, error } = await supabase
    .from('patient_visits')
    .insert([
      {
        raw_transcript: transcript,
        patient_data: patientData,
        symptoms_data: symptomsData,
        receptionist_id: receptionistId,
      }
    ])
    .select();

  if (error) {
    console.error("CRITICAL DATABASE FAILURE:", error.message, error.details);
    throw new Error(`Database Error: ${error.message}`);
  }

  console.log("SUCCESS: Data secured in Vault.", data);

  if (!data || data.length === 0) {
    throw new Error('No data returned after saving patient visit');
  }

  return data[0] as PatientVisit;
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

export const updatePatientVisit = async (
  visitId: string,
  transcript: string,
  patientData: any,
  symptomsData: any[]
): Promise<void> => {
  if (!Array.isArray(symptomsData)) {
    throw new Error('Symptoms data must be an array');
  }

  if (typeof patientData !== 'object' || patientData === null) {
    throw new Error('Patient data must be an object');
  }

  const { error } = await supabase.rpc('update_patient_visit', {
    row_id: visitId,
    new_transcript: transcript,
    new_patient_data: patientData,
    new_symptoms_data: symptomsData,
  });

  if (error) {
    console.error('Update failed:', error);
    if (error.message.includes('Not authenticated')) {
      throw new Error('You must be logged in to update patient visits');
    } else if (error.message.includes('not found or access denied')) {
      throw new Error('Unable to update: record not found or access denied');
    } else {
      throw new Error(`Failed to update visit: ${error.message}`);
    }
  }
};

export const deletePatientVisit = async (visitId: string): Promise<void> => {
  const { error } = await supabase
    .from('patient_visits')
    .delete()
    .eq('id', visitId);

  if (error) {
    throw new Error(`Failed to delete visit: ${error.message}`);
  }
};
