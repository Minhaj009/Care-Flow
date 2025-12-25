/*
  # Create profiles table for Clinical Flows

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users.id
      - `full_name` (text) - doctor's full name
      - `clinic_name` (text) - name of the clinic
      - `phone_number` (text) - contact phone number
      - `created_at` (timestamptz) - when profile was created
      - `updated_at` (timestamptz) - when profile was last updated

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to insert their own profile
    - Add policy for users to update their own profile

  3. Important Notes
    - This table stores extended user information beyond basic auth
    - The id column MUST match the auth.users.id for proper user association
    - All fields are required for a complete profile setup
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  clinic_name text NOT NULL,
  phone_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);