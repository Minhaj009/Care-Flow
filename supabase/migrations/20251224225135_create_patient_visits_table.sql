/*
  # Create Patient Visits Table

  ## Overview
  This migration creates the core table for storing patient check-in data from voice recordings.
  The table stores both raw transcripts and AI-extracted patient information.

  ## New Tables
  
  ### `patient_visits`
  Stores all patient check-in records with voice transcripts and extracted data.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each visit
  - `created_at` (timestamptz) - Timestamp when the check-in was recorded
  - `raw_transcript` (text) - Original speech-to-text transcript
  - `patient_data` (jsonb) - Extracted patient information (name, age)
  - `symptoms_data` (jsonb) - Extracted symptoms and duration information
  
  **Indexes:**
  - Primary key on `id`
  - Index on `created_at` for efficient sorting and querying recent visits
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `patient_visits` table
  - Public insert policy allows new check-ins to be created
  - Public select policy allows reading check-in records
  
  **Note:** In production, these policies should be restricted based on authentication
  and proper access control requirements.
  
  ## Usage
  This table supports:
  - Storing voice transcripts from medical check-ins
  - Saving AI-extracted patient information in structured format
  - Querying recent check-ins for display in the application
*/

-- Create patient_visits table
CREATE TABLE IF NOT EXISTS patient_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  raw_transcript text NOT NULL,
  patient_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  symptoms_data jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS patient_visits_created_at_idx ON patient_visits(created_at DESC);

-- Enable Row Level Security
ALTER TABLE patient_visits ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting new patient visits
-- In production, restrict this to authenticated users
CREATE POLICY "Allow public insert for patient visits"
  ON patient_visits
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy for selecting patient visits
-- In production, restrict this to authenticated users with proper access
CREATE POLICY "Allow public select for patient visits"
  ON patient_visits
  FOR SELECT
  TO public
  USING (true);