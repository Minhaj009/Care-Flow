/*
  # Create Vital Signs Table

  ## Overview
  This migration creates the vital_signs table to store patient vital sign measurements
  taken during check-ins. Includes blood pressure, temperature, pulse, respiratory rate,
  oxygen saturation, weight, and height.

  ## Changes Made

  ### 1. New Tables
  - `vital_signs` table
    - `id` (uuid, primary key) - Unique measurement identifier
    - `patient_id` (uuid, required) - Foreign key to patients table
    - `visit_id` (uuid, optional) - Foreign key to patient_visits table
    - `blood_pressure_systolic` (integer) - Systolic BP in mmHg
    - `blood_pressure_diastolic` (integer) - Diastolic BP in mmHg
    - `temperature` (numeric) - Body temperature
    - `temperature_unit` (text) - Celsius or Fahrenheit
    - `pulse_rate` (integer) - Heart rate in bpm
    - `respiratory_rate` (integer) - Breaths per minute
    - `oxygen_saturation` (integer) - SpO2 percentage
    - `weight` (numeric) - Weight in kg
    - `height` (numeric) - Height in cm
    - `notes` (text) - Additional observations
    - `measured_by` (uuid, required) - Receptionist who took measurements
    - `measured_at` (timestamptz) - When measurements were taken
    - `created_at` (timestamptz) - Record creation timestamp

  ### 2. Indexes
  - `vital_signs_patient_id_idx` - Fast lookup by patient
  - `vital_signs_visit_id_idx` - Link to specific visits
  - `vital_signs_measured_at_idx` - Sort by measurement time

  ### 3. Security (RLS Policies)
  - Enable RLS on vital_signs table
  - Access controlled through patient ownership

  ## Important Notes
  - All measurements are optional (nullable) as not all may be taken each time
  - Temperature unit stored separately for flexibility
  - Linked to both patient and visit for comprehensive tracking
*/

-- Create vital_signs table
CREATE TABLE IF NOT EXISTS vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id uuid REFERENCES patient_visits(id) ON DELETE SET NULL,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  temperature numeric(4,1),
  temperature_unit text DEFAULT 'Celsius',
  pulse_rate integer,
  respiratory_rate integer,
  oxygen_saturation integer,
  weight numeric(5,2),
  height numeric(5,2),
  notes text DEFAULT '',
  measured_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS vital_signs_patient_id_idx ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS vital_signs_visit_id_idx ON vital_signs(visit_id);
CREATE INDEX IF NOT EXISTS vital_signs_measured_at_idx ON vital_signs(measured_at DESC);

-- Enable RLS
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert vital signs for patients they own
CREATE POLICY "receptionist_insert_vital_signs"
  ON vital_signs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = measured_by AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can view vital signs for patients they own
CREATE POLICY "receptionist_select_vital_signs"
  ON vital_signs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can update vital signs they measured for patients they own
CREATE POLICY "receptionist_update_vital_signs"
  ON vital_signs
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = measured_by AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = measured_by AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );

-- Policy: Users can delete vital signs they measured for patients they own
CREATE POLICY "receptionist_delete_vital_signs"
  ON vital_signs
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = measured_by AND
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = vital_signs.patient_id
      AND patients.receptionist_id = auth.uid()
    )
  );