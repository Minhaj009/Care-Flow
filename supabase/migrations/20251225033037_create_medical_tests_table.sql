/*
  # Create Medical Tests Table

  ## Overview
  This migration creates the medical_tests table to store laboratory test results,
  diagnostic reports, and associated file attachments (scanned reports, images).

  ## Changes Made

  ### 1. New Tables
  - `medical_tests` table
    - `id` (uuid, primary key) - Unique test record identifier
    - `patient_id` (uuid, required) - Foreign key to patients table
    - `test_type` (text, required) - Type of test (Blood Test, X-Ray, MRI, etc.)
    - `test_date` (date, required) - Date when test was performed
    - `lab_name` (text) - Name of laboratory or facility
    - `test_values` (jsonb) - Structured test results with values, units, ranges
    - `doctor_notes` (text) - Doctor's notes or interpretation
    - `file_attachments` (jsonb) - Array of uploaded file metadata
    - `receptionist_id` (uuid, required) - Who uploaded this test record
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 2. Indexes
  - `medical_tests_patient_id_idx` - Fast lookup by patient
  - `medical_tests_test_date_idx` - Sort by test date
  - `medical_tests_receptionist_id_idx` - Filter by receptionist

  ### 3. Security (RLS Policies)
  - Enable RLS on medical_tests table
  - Access controlled through patient ownership

  ## Important Notes
  - File attachments stored as JSONB with metadata (path, name, size, type)
  - Actual files stored in Supabase Storage bucket
  - Test values stored as flexible JSONB for different test types
*/

-- Create medical_tests table
CREATE TABLE IF NOT EXISTS medical_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_type text NOT NULL,
  test_date date NOT NULL,
  lab_name text DEFAULT '',
  test_values jsonb DEFAULT '[]'::jsonb,
  doctor_notes text DEFAULT '',
  file_attachments jsonb DEFAULT '[]'::jsonb,
  receptionist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS medical_tests_patient_id_idx ON medical_tests(patient_id);
CREATE INDEX IF NOT EXISTS medical_tests_test_date_idx ON medical_tests(test_date DESC);
CREATE INDEX IF NOT EXISTS medical_tests_receptionist_id_idx ON medical_tests(receptionist_id);

-- Enable RLS
ALTER TABLE medical_tests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert tests for patients they own
CREATE POLICY "receptionist_insert_medical_tests"
  ON medical_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = receptionist_id AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can view tests for patients they own
CREATE POLICY "receptionist_select_medical_tests"
  ON medical_tests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can update tests they created for patients they own
CREATE POLICY "receptionist_update_medical_tests"
  ON medical_tests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = receptionist_id AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = receptionist_id AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can delete tests they created for patients they own
CREATE POLICY "receptionist_delete_medical_tests"
  ON medical_tests
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = receptionist_id AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );