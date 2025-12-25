/*
  # Create Patients Master Table

  ## Overview
  This migration creates the patients table as the central registry for all patient information.
  Supports both regular patients with CNIC and walk-in patients without identification.

  ## Changes Made

  ### 1. New Tables
  - `patients` table
    - `id` (uuid, primary key) - Unique patient identifier
    - `cnic` (text, optional, unique) - National ID card number for registered patients
    - `full_name` (text, required) - Patient's full name
    - `phone_number` (text, optional) - Contact phone number
    - `email` (text, optional) - Email address
    - `address` (text, optional) - Residential address
    - `city` (text, optional) - City of residence
    - `date_of_birth` (date, optional) - Date of birth for age calculation
    - `gender` (text, optional) - Gender (Male/Female/Other)
    - `blood_group` (text, optional) - Blood group (A+, B+, O+, AB+, etc.)
    - `marital_status` (text, optional) - Marital status
    - `emergency_contact_name` (text, optional) - Emergency contact person name
    - `emergency_contact_phone` (text, optional) - Emergency contact phone
    - `photo_url` (text, optional) - URL to patient photo in storage
    - `receptionist_id` (uuid, required) - Foreign key to auth.users (who created this patient)
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 2. Indexes
  - `patients_cnic_idx` - Fast lookup by CNIC
  - `patients_phone_idx` - Fast lookup by phone number
  - `patients_name_idx` - Fast text search by name
  - `patients_receptionist_id_idx` - Filter by receptionist

  ### 3. Security (RLS Policies)
  - Enable RLS on patients table
  - `receptionist_insert_patients` - Authenticated users can create patients with their own ID
  - `receptionist_select_own_patients` - Authenticated users can view patients they created
  - `receptionist_update_own_patients` - Authenticated users can update patients they created
  - `receptionist_delete_own_patients` - Authenticated users can delete patients they created

  ## Important Notes
  - CNIC is optional to support walk-in patients without identification
  - CNIC must be unique when provided (partial unique index)
  - Phone number and email are optional but recommended
  - All patients must be linked to a receptionist who created the record
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cnic text,
  full_name text NOT NULL,
  phone_number text,
  email text,
  address text,
  city text,
  date_of_birth date,
  gender text,
  blood_group text,
  marital_status text,
  emergency_contact_name text,
  emergency_contact_phone text,
  photo_url text,
  receptionist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on CNIC only for non-null values
CREATE UNIQUE INDEX IF NOT EXISTS patients_cnic_unique_idx ON patients(cnic) WHERE cnic IS NOT NULL;

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS patients_cnic_idx ON patients(cnic);
CREATE INDEX IF NOT EXISTS patients_phone_idx ON patients(phone_number);
CREATE INDEX IF NOT EXISTS patients_name_idx ON patients USING gin(to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS patients_receptionist_id_idx ON patients(receptionist_id);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert patients with their own receptionist_id
CREATE POLICY "receptionist_insert_patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = receptionist_id);

-- Policy: Authenticated users can view patients they created
CREATE POLICY "receptionist_select_own_patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = receptionist_id);

-- Policy: Authenticated users can update patients they created
CREATE POLICY "receptionist_update_own_patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receptionist_id)
  WITH CHECK (auth.uid() = receptionist_id);

-- Policy: Authenticated users can delete patients they created
CREATE POLICY "receptionist_delete_own_patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = receptionist_id);