/*
  # Create Lab Results Table

  1. New Tables
    - `lab_results`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to patients)
      - `test_category` (text) - Chemistry, Hematology, Urinalysis, etc.
      - `test_name` (text) - Name of the test
      - `test_code` (text, optional) - LOINC or other standard code
      - `result_value` (text) - The result value
      - `result_unit` (text, optional) - Unit of measurement
      - `reference_range_low` (text, optional) - Lower bound of normal range
      - `reference_range_high` (text, optional) - Upper bound of normal range
      - `interpretation` (text) - Normal, Abnormal Low, Abnormal High, Critical
      - `collection_date` (date) - When sample was collected
      - `result_date` (date) - When result was finalized
      - `ordering_provider` (text, optional) - Provider who ordered the test
      - `performing_lab` (text, optional) - Lab that performed the test
      - `notes` (text, optional) - Additional notes
      - `is_reviewed` (boolean) - Whether result has been reviewed
      - `reviewed_by` (uuid, optional) - User who reviewed
      - `reviewed_at` (timestamptz, optional) - When it was reviewed
      - `created_at` (timestamptz) - Record creation time
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on `lab_results` table
    - Add policy for authenticated users to manage lab results

  3. Indexes
    - Index on patient_id for faster lookups
    - Index on test_category for filtering
    - Index on interpretation for finding abnormal results
*/

CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_category text NOT NULL DEFAULT 'Other',
  test_name text NOT NULL,
  test_code text,
  result_value text NOT NULL,
  result_unit text,
  reference_range_low text,
  reference_range_high text,
  interpretation text NOT NULL DEFAULT 'Pending',
  collection_date date NOT NULL,
  result_date date NOT NULL,
  ordering_provider text,
  performing_lab text,
  notes text,
  is_reviewed boolean NOT NULL DEFAULT false,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lab results"
  ON lab_results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert lab results"
  ON lab_results
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update lab results"
  ON lab_results
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test_category ON lab_results(test_category);
CREATE INDEX IF NOT EXISTS idx_lab_results_interpretation ON lab_results(interpretation);
CREATE INDEX IF NOT EXISTS idx_lab_results_result_date ON lab_results(result_date DESC);