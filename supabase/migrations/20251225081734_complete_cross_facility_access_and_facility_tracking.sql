/*
  # Complete Cross-Facility Patient Data Access and Facility Tracking

  ## Overview
  This migration completes the cross-facility patient data sharing implementation by:
  1. Adding facility_name columns to patients and patient_visits for origin tracking
  2. Updating RLS policies on all remaining tables to allow authenticated users read access
  3. Enabling full continuity of care across all healthcare facilities

  ## Changes Made

  ### 1. Facility Tracking Columns
  - `patients.facility_name` - Name of the facility that registered the patient
  - `patient_visits.facility_name` - Name of the facility where the visit occurred

  ### 2. Tables with Updated RLS Policies (Read Access for All Authenticated Users)
  - encounter_notes - SOAP notes and clinical encounters
  - treatment_plans - Patient treatment plans
  - progress_notes - Clinical progress documentation
  - clinical_orders - Lab orders, imaging requests
  - discharge_summaries - Hospital discharge records
  - referrals - Inter-facility referrals
  - care_transitions - Patient transfers between facilities
  - immunizations - Vaccination records
  - preventive_care_recommendations - Preventive care tracking
  - appointments - Scheduling data
  - appointment_reminders - Notification records
  - patient_insurance - Insurance information
  - patient_encounters_billing - Billing encounters
  - patient_payments - Payment records
  - clinical_alerts - Safety alerts and warnings
  - medication_administration_record - Medication tracking
  - medication_reconciliation - Medication review records
  - care_teams - Care team assignments
  - care_team_members - Care team membership

  ## Security Notes
  - All policies require authentication (TO authenticated)
  - Read access (SELECT) is granted to all authenticated users
  - Write access remains restricted to appropriate users (providers, receptionists)
  - Enables legitimate cross-facility care coordination
  - CNIC serves as universal patient identifier for lookups

  ## Important Notes
  - Original INSERT/UPDATE/DELETE policies remain unchanged
  - New SELECT policies use USING (true) for authenticated users
  - This enables doctors at any facility to view patient history
*/

-- ============================================================================
-- PART 1: ADD FACILITY TRACKING COLUMNS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'facility_name'
  ) THEN
    ALTER TABLE patients ADD COLUMN facility_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_visits' AND column_name = 'facility_name'
  ) THEN
    ALTER TABLE patient_visits ADD COLUMN facility_name text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS patients_facility_name_idx ON patients(facility_name);
CREATE INDEX IF NOT EXISTS patient_visits_facility_name_idx ON patient_visits(facility_name);


-- ============================================================================
-- PART 2: UPDATE RLS POLICIES FOR CLINICAL TABLES
-- ============================================================================

-- encounter_notes - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'encounter_notes') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view encounter notes" ON encounter_notes;
    
    CREATE POLICY "authenticated_users_select_encounter_notes"
      ON encounter_notes FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- treatment_plans - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'treatment_plans') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view treatment plans" ON treatment_plans;
    
    CREATE POLICY "authenticated_users_select_treatment_plans"
      ON treatment_plans FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- progress_notes - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'progress_notes') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view progress notes" ON progress_notes;
    
    CREATE POLICY "authenticated_users_select_progress_notes"
      ON progress_notes FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- clinical_orders - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clinical_orders') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view clinical orders" ON clinical_orders;
    
    CREATE POLICY "authenticated_users_select_clinical_orders"
      ON clinical_orders FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- discharge_summaries - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'discharge_summaries') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view discharge summaries" ON discharge_summaries;
    
    CREATE POLICY "authenticated_users_select_discharge_summaries"
      ON discharge_summaries FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- referrals - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'referrals') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view referrals" ON referrals;
    
    CREATE POLICY "authenticated_users_select_referrals"
      ON referrals FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- care_transitions - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'care_transitions') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view care transitions" ON care_transitions;
    
    CREATE POLICY "authenticated_users_select_care_transitions"
      ON care_transitions FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- immunizations - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'immunizations') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view immunizations" ON immunizations;
    
    CREATE POLICY "authenticated_users_select_immunizations"
      ON immunizations FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- preventive_care_recommendations - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'preventive_care_recommendations') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view preventive care" ON preventive_care_recommendations;
    
    CREATE POLICY "authenticated_users_select_preventive_care"
      ON preventive_care_recommendations FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- appointments - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'appointments') THEN
    DROP POLICY IF EXISTS "Staff can view appointments" ON appointments;
    
    CREATE POLICY "authenticated_users_select_appointments"
      ON appointments FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- appointment_reminders - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'appointment_reminders') THEN
    DROP POLICY IF EXISTS "Staff can view reminders" ON appointment_reminders;
    
    CREATE POLICY "authenticated_users_select_reminders"
      ON appointment_reminders FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- patient_insurance - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'patient_insurance') THEN
    DROP POLICY IF EXISTS "Staff can view patient insurance" ON patient_insurance;
    
    CREATE POLICY "authenticated_users_select_patient_insurance"
      ON patient_insurance FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- patient_encounters_billing - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'patient_encounters_billing') THEN
    DROP POLICY IF EXISTS "Staff can view encounter billing" ON patient_encounters_billing;
    
    CREATE POLICY "authenticated_users_select_encounter_billing"
      ON patient_encounters_billing FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- patient_payments - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'patient_payments') THEN
    DROP POLICY IF EXISTS "Staff can view patient payments" ON patient_payments;
    
    CREATE POLICY "authenticated_users_select_patient_payments"
      ON patient_payments FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- clinical_alerts - Allow all authenticated users to read (important for safety)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clinical_alerts') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view alerts" ON clinical_alerts;
    
    CREATE POLICY "authenticated_users_select_clinical_alerts"
      ON clinical_alerts FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- medication_administration_record - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'medication_administration_record') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view MAR" ON medication_administration_record;
    
    CREATE POLICY "authenticated_users_select_mar"
      ON medication_administration_record FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- medication_reconciliation - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'medication_reconciliation') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view reconciliation" ON medication_reconciliation;
    
    CREATE POLICY "authenticated_users_select_medication_reconciliation"
      ON medication_reconciliation FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- care_teams - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'care_teams') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view care teams" ON care_teams;
    
    CREATE POLICY "authenticated_users_select_care_teams"
      ON care_teams FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- care_team_members - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'care_team_members') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view care team members" ON care_team_members;
    
    CREATE POLICY "authenticated_users_select_care_team_members"
      ON care_team_members FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- allergy_list - Allow all authenticated users to read (critical for patient safety)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'allergy_list') THEN
    DROP POLICY IF EXISTS "Healthcare providers can view allergies" ON allergy_list;
    
    CREATE POLICY "authenticated_users_select_allergies"
      ON allergy_list FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- appointment_types - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'appointment_types') THEN
    DROP POLICY IF EXISTS "Authenticated users can view appointment types" ON appointment_types;
    
    CREATE POLICY "authenticated_users_select_appointment_types"
      ON appointment_types FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- provider_schedules - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'provider_schedules') THEN
    DROP POLICY IF EXISTS "Authenticated users can view provider schedules" ON provider_schedules;
    
    CREATE POLICY "authenticated_users_select_provider_schedules"
      ON provider_schedules FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- schedule_exceptions - Allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'schedule_exceptions') THEN
    DROP POLICY IF EXISTS "Authenticated users can view schedule exceptions" ON schedule_exceptions;
    
    CREATE POLICY "authenticated_users_select_schedule_exceptions"
      ON schedule_exceptions FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;


-- ============================================================================
-- PART 3: UPDATE RELATED TABLES FOR CROSS-FACILITY SUPPORT
-- ============================================================================

-- organizations - Allow all authenticated users to view organizations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'organizations') THEN
    DROP POLICY IF EXISTS "Authenticated users can view organizations" ON organizations;
    
    CREATE POLICY "authenticated_users_select_organizations"
      ON organizations FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- healthcare_providers - Allow all authenticated users to view providers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'healthcare_providers') THEN
    DROP POLICY IF EXISTS "Authenticated users can view healthcare providers" ON healthcare_providers;
    
    CREATE POLICY "authenticated_users_select_healthcare_providers"
      ON healthcare_providers FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;


-- ============================================================================
-- PART 4: CREATE HELPER FUNCTION FOR FACILITY LOOKUP
-- ============================================================================

CREATE OR REPLACE FUNCTION get_patient_facilities(p_patient_id uuid)
RETURNS TABLE (
  facility_name text,
  visit_count bigint,
  last_visit timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.facility_name,
    COUNT(*)::bigint as visit_count,
    MAX(pv.created_at) as last_visit
  FROM patient_visits pv
  WHERE pv.patient_id = p_patient_id
    AND pv.facility_name IS NOT NULL
  GROUP BY pv.facility_name
  ORDER BY last_visit DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_patient_facilities(uuid) TO authenticated;
