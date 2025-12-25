/*
  # Add Index for Foreign Key on receptionist_id

  ## Overview
  This migration adds an index on the receptionist_id column in the patient_visits 
  table to optimize queries that filter or join on this foreign key relationship.

  ## Changes Made

  ### 1. Create Index
  - Add index on `patient_visits.receptionist_id`
  - **Purpose**: Improve performance for queries filtering by receptionist_id
  - **Use Case**: Essential for efficient foreign key lookups and joins

  ## Performance Impact
  - Significantly improves query performance when filtering patient visits by receptionist
  - Optimizes JOIN operations with auth.users table
  - Prevents full table scans when looking up visits by receptionist

  ## Notes
  - Foreign keys should always have covering indexes for optimal performance
  - This index was previously removed but is actually necessary for query optimization
*/

-- Create index on receptionist_id foreign key
CREATE INDEX IF NOT EXISTS patient_visits_receptionist_id_idx 
ON patient_visits(receptionist_id);