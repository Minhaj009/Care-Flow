/*
  # Fix Security and Performance Issues
  
  This migration addresses several critical security and performance issues:
  
  ## 1. Performance Optimizations
  
  ### Add Missing Index
  - Add index on `vital_signs.measured_by` for foreign key constraint
  
  ### Remove Unused Indexes
  - Remove `medical_tests_test_date_idx` (unused)
  - Remove `medical_tests_receptionist_id_idx` (unused)
  - Remove `vital_signs_measured_at_idx` (unused)
  - Remove `patients_cnic_idx` (unused)
  - Remove `patients_phone_idx` (unused)
  - Remove `patients_name_idx` (unused)
  
  ## 2. RLS Policy Optimization
  
  Replace all `auth.uid()` calls with `(select auth.uid())` to prevent row-by-row re-evaluation.
  This affects policies on:
  - `patients` (4 policies)
  - `patient_medical_history` (4 policies)
  - `medical_tests` (4 policies)
  - `vital_signs` (4 policies)
  - `patient_visits` (1 policy)
  
  ## 3. Fix Multiple Permissive Policies
  
  Convert `receptionist_select_own` policy to RESTRICTIVE to work alongside 
  `receptionist_select_visits_through_patients` policy properly.
  
  ## 4. Fix Function Security
  
  Update `delete_user_account` function with immutable search_path.
  
  ## Security Notes
  - All changes maintain existing security requirements
  - Performance improvements do not compromise data protection
  - RLS policies remain restrictive and properly authenticated
*/

-- ============================================================================
-- 1. ADD MISSING INDEX
-- ============================================================================

CREATE INDEX IF NOT EXISTS vital_signs_measured_by_idx 
  ON vital_signs(measured_by);

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS medical_tests_test_date_idx;
DROP INDEX IF EXISTS medical_tests_receptionist_id_idx;
DROP INDEX IF EXISTS vital_signs_measured_at_idx;
DROP INDEX IF EXISTS patients_cnic_idx;
DROP INDEX IF EXISTS patients_phone_idx;
DROP INDEX IF EXISTS patients_name_idx;

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES - PATIENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "receptionist_insert_patients" ON patients;
DROP POLICY IF EXISTS "receptionist_select_own_patients" ON patients;
DROP POLICY IF EXISTS "receptionist_update_own_patients" ON patients;
DROP POLICY IF EXISTS "receptionist_delete_own_patients" ON patients;

CREATE POLICY "receptionist_insert_patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (receptionist_id = (select auth.uid()));

CREATE POLICY "receptionist_select_own_patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (receptionist_id = (select auth.uid()));

CREATE POLICY "receptionist_update_own_patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (receptionist_id = (select auth.uid()))
  WITH CHECK (receptionist_id = (select auth.uid()));

CREATE POLICY "receptionist_delete_own_patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (receptionist_id = (select auth.uid()));

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - PATIENT_MEDICAL_HISTORY TABLE
-- ============================================================================

DROP POLICY IF EXISTS "receptionist_insert_medical_history" ON patient_medical_history;
DROP POLICY IF EXISTS "receptionist_select_medical_history" ON patient_medical_history;
DROP POLICY IF EXISTS "receptionist_update_medical_history" ON patient_medical_history;
DROP POLICY IF EXISTS "receptionist_delete_medical_history" ON patient_medical_history;

CREATE POLICY "receptionist_insert_medical_history"
  ON patient_medical_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_select_medical_history"
  ON patient_medical_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_update_medical_history"
  ON patient_medical_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_delete_medical_history"
  ON patient_medical_history
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 5. OPTIMIZE RLS POLICIES - MEDICAL_TESTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "receptionist_insert_medical_tests" ON medical_tests;
DROP POLICY IF EXISTS "receptionist_select_medical_tests" ON medical_tests;
DROP POLICY IF EXISTS "receptionist_update_medical_tests" ON medical_tests;
DROP POLICY IF EXISTS "receptionist_delete_medical_tests" ON medical_tests;

CREATE POLICY "receptionist_insert_medical_tests"
  ON medical_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_select_medical_tests"
  ON medical_tests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_update_medical_tests"
  ON medical_tests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_delete_medical_tests"
  ON medical_tests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_tests.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 6. OPTIMIZE RLS POLICIES - VITAL_SIGNS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "receptionist_insert_vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "receptionist_select_vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "receptionist_update_vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "receptionist_delete_vital_signs" ON vital_signs;

CREATE POLICY "receptionist_insert_vital_signs"
  ON vital_signs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_visits
      JOIN patients ON patients.id = patient_visits.patient_id
      WHERE patient_visits.id = vital_signs.visit_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_select_vital_signs"
  ON vital_signs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_visits
      JOIN patients ON patients.id = patient_visits.patient_id
      WHERE patient_visits.id = vital_signs.visit_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_update_vital_signs"
  ON vital_signs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_visits
      JOIN patients ON patients.id = patient_visits.patient_id
      WHERE patient_visits.id = vital_signs.visit_id
      AND patients.receptionist_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_visits
      JOIN patients ON patients.id = patient_visits.patient_id
      WHERE patient_visits.id = vital_signs.visit_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

CREATE POLICY "receptionist_delete_vital_signs"
  ON vital_signs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_visits
      JOIN patients ON patients.id = patient_visits.patient_id
      WHERE patient_visits.id = vital_signs.visit_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 7. OPTIMIZE RLS POLICIES - PATIENT_VISITS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "receptionist_select_visits_through_patients" ON patient_visits;

CREATE POLICY "receptionist_select_visits_through_patients"
  ON patient_visits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_visits.patient_id
      AND patients.receptionist_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 8. FIX MULTIPLE PERMISSIVE POLICIES ISSUE
-- ============================================================================

DROP POLICY IF EXISTS "receptionist_select_own" ON patient_visits;

CREATE POLICY "receptionist_select_own"
  ON patient_visits
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (receptionist_id = (select auth.uid()));

-- ============================================================================
-- 9. FIX FUNCTION SECURITY - UPDATE delete_user_account
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;