/*
  # Add Next Visit Field to Patient Visits

  1. Changes
    - Add `next_visit` column to `patient_visits` table
      - Type: date (nullable)
      - Stores the scheduled date for the patient's next visit
      - Optional field that can be left null
    
  2. Notes
    - This allows healthcare providers to schedule follow-up appointments
    - The field is optional and can be updated later if needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_visits' AND column_name = 'next_visit'
  ) THEN
    ALTER TABLE patient_visits 
    ADD COLUMN next_visit date;
  END IF;
END $$;