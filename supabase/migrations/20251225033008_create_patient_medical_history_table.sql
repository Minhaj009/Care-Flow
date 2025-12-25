/*
  # Create Patient Medical History Table

  ## Overview
  This migration creates the patient_medical_history table to store comprehensive
  medical history information including allergies, chronic conditions, medications,
  surgeries, and family history.

  ## Changes Made

  ### 1. New Tables
  - `patient_medical_history` table
    - `id` (uuid, primary key) - Unique record identifier
    - `patient_id` (uuid, required) - Foreign key to patients table
    - `known_allergies` (jsonb) - Array of allergies with name, severity, reaction
    - `chronic_conditions` (jsonb) - Array of chronic conditions with name, diagnosis date
    - `current_medications` (jsonb) - Array of current medications with details
    - `past_surgeries` (jsonb) - Array of past surgeries with name, date, hospital
    - `family_medical_history` (text) - Free text for family medical history
    - `smoking_status` (text) - Smoking status (Never/Former/Current)
    - `alcohol_consumption` (text) - Alcohol consumption level
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 2. Indexes
  - `patient_medical_history_patient_id_idx` - Fast lookup by patient

  ### 3. Security (RLS Policies)
  - Enable RLS on patient_medical_history table
  - Medical history inherits access from patients table (receptionist can access if they own the patient)

  ## Important Notes
  - Each patient has one medical history record
  - JSONB fields allow flexible structured data storage
  - Access is controlled through the patient ownership relationship
*/

-- Create patient_medical_history table
CREATE TABLE IF NOT EXISTS patient_medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  known_allergies jsonb DEFAULT '[]'::jsonb,
  chronic_conditions jsonb DEFAULT '[]'::jsonb,
  current_medications jsonb DEFAULT '[]'::jsonb,
  past_surgeries jsonb DEFAULT '[]'::jsonb,
  family_medical_history text DEFAULT '',
  smoking_status text DEFAULT 'Never',
  alcohol_consumption text DEFAULT 'None',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(patient_id)
);

-- Create index for fast patient lookup
CREATE INDEX IF NOT EXISTS patient_medical_history_patient_id_idx ON patient_medical_history(patient_id);

-- Enable RLS
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert medical history for patients they own
CREATE POLICY "receptionist_insert_medical_history"
  ON patient_medical_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can view medical history for patients they own
CREATE POLICY "receptionist_select_medical_history"
  ON patient_medical_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can update medical history for patients they own
CREATE POLICY "receptionist_update_medical_history"
  ON patient_medical_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can delete medical history for patients they own
CREATE POLICY "receptionist_delete_medical_history"
  ON patient_medical_history
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );