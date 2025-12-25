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

export const deletePatientVisit = async (visitId: string): Promise<void> => {
  const { error } = await supabase
    .from('patient_visits')
    .delete()
    .eq('id', visitId);

  if (error) {
    throw new Error(`Failed to delete visit: ${error.message}`);
  }
};

export const updatePatientVisit = async (
  visitId: string,
  updatedData: Partial<PatientVisit>
): Promise<PatientVisit> => {
  const updatePayload: any = {};

  if (updatedData.raw_transcript !== undefined) {
    updatePayload.raw_transcript = updatedData.raw_transcript;
  }
  if (updatedData.patient_data !== undefined) {
    updatePayload.patient_data = updatedData.patient_data;
  }
  if (updatedData.symptoms_data !== undefined) {
    updatePayload.symptoms_data = updatedData.symptoms_data;
  }

  console.log("Updating visit with payload:", updatePayload);

  const { data, error } = await supabase
    .from('patient_visits')
    .update(updatePayload)
    .eq('id', visitId)
    .select();

  if (error) {
    throw new Error(`Failed to update visit: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No data returned after updating patient visit');
  }

  return data[0] as PatientVisit;
};
