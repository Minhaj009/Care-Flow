/*
  # Update Patient Visits Table

  ## Overview
  This migration adds new fields to the patient_visits table to link visits to
  the patients master table and add additional clinical information fields.

  ## Changes Made

  ### 1. Schema Updates
  - Add `patient_id` (uuid) - Foreign key to patients table
  - Add `visit_type` (text) - Type of visit (New Visit, Follow-up, Emergency)
  - Add `doctor_name` (text) - Name of assigned doctor
  - Add `consultation_fee` (numeric) - Fee charged for consultation
  - Add `follow_up_date` (date) - Scheduled follow-up date
  - Add `visit_notes` (text) - Additional observations or notes

  ### 2. Indexes
  - `patient_visits_patient_id_idx` - Fast lookup by patient

  ### 3. RLS Policy Updates
  - Add policy to access visits through patient ownership
  - Users can access visits for patients they own

  ## Important Notes
  - patient_id links visits to the master patient record
  - Existing visits may have null patient_id (for backward compatibility)
  - New visits should always include patient_id
*/

-- Add new columns to patient_visits table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_visits' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE patient_visits ADD COLUMN patient_id uuid REFERENCES patients(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_visits' AND column_name = 'visit_type'
  ) THEN
    ALTER TABLE patient_visits ADD COLUMN visit_type text DEFAULT 'New Visit';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_visits' AND column_name = 'doctor_name'
  ) THEN
    ALTER TABLE patient_visits ADD COLUMN doctor_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_visits' AND column_name = 'consultation_fee'
  ) THEN
    ALTER TABLE patient_visits ADD COLUMN consultation_fee numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_visits' AND column_name = 'follow_up_date'
  ) THEN
    ALTER TABLE patient_visits ADD COLUMN follow_up_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_visits' AND column_name = 'visit_notes'
  ) THEN
    ALTER TABLE patient_visits ADD COLUMN visit_notes text DEFAULT '';
  END IF;
END $$;

-- Create index on patient_id
CREATE INDEX IF NOT EXISTS patient_visits_patient_id_idx ON patient_visits(patient_id);

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "receptionist_select_visits_through_patients" ON patient_visits;

-- Add policy for accessing visits through patient ownership
CREATE POLICY "receptionist_select_visits_through_patients"
  ON patient_visits
  FOR SELECT
  TO authenticated
  USING (
    patient_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_visits.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );