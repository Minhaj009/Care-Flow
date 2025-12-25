/*
  # Fix Security and Performance Issues

  1. Indexes for Unindexed Foreign Keys
    - Adding indexes on foreign key columns to improve query performance

  2. RLS Policy Optimization
    - Updating policies to use `(select auth.uid())` instead of `auth.uid()`

  3. Function Search Path Security
    - Setting immutable search paths on functions
*/

-- =====================================================
-- PART 1: CREATE INDEXES FOR UNINDEXED FOREIGN KEYS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_appointments_appointment_type_id ON appointments(appointment_type_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_care_transitions_acknowledged_by ON care_transitions(acknowledged_by);
CREATE INDEX IF NOT EXISTS idx_care_transitions_from_provider_id ON care_transitions(from_provider_id);
CREATE INDEX IF NOT EXISTS idx_care_transitions_to_provider_id ON care_transitions(to_provider_id);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_acknowledged_by ON clinical_alerts(acknowledged_by);
CREATE INDEX IF NOT EXISTS idx_clinical_orders_performed_by ON clinical_orders(performed_by);
CREATE INDEX IF NOT EXISTS idx_clinical_orders_visit_id ON clinical_orders(visit_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_witnessed_by ON consent_logs(witnessed_by);
CREATE INDEX IF NOT EXISTS idx_discharge_summaries_provider_id ON discharge_summaries(provider_id);
CREATE INDEX IF NOT EXISTS idx_immunizations_administered_by ON immunizations(administered_by);
CREATE INDEX IF NOT EXISTS idx_lab_results_reviewed_by ON lab_results(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_medical_tests_receptionist_id ON medical_tests(receptionist_id);
CREATE INDEX IF NOT EXISTS idx_mar_administered_by ON medication_administration_record(administered_by);
CREATE INDEX IF NOT EXISTS idx_medication_reconciliation_reconciled_by ON medication_reconciliation(reconciled_by);
CREATE INDEX IF NOT EXISTS idx_medication_reconciliation_transition_id ON medication_reconciliation(transition_id);
CREATE INDEX IF NOT EXISTS idx_medications_prescribed_pharmacy_id ON medications_prescribed(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_parent_message_id ON patient_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_patient_payments_processed_by ON patient_payments(processed_by);
CREATE INDEX IF NOT EXISTS idx_preventive_screenings_performed_by ON preventive_screenings(performed_by);
CREATE INDEX IF NOT EXISTS idx_progress_notes_provider_id ON progress_notes(provider_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_treatment_plan_id ON progress_notes(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_appointment_type_id ON recurring_appointments(appointment_type_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_to_organization_id ON referrals(referred_to_organization_id);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved_by ON security_events(resolved_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON user_roles(granted_by);
CREATE INDEX IF NOT EXISTS idx_waitlist_appointment_type_id ON waitlist(appointment_type_id);
CREATE INDEX IF NOT EXISTS idx_wellness_program_enrollments_enrolled_by ON wellness_program_enrollments(enrolled_by);

-- =====================================================
-- PART 2: FIX RLS POLICIES TO USE (SELECT AUTH.UID())
-- =====================================================

-- Drop and recreate care_teams policies
DROP POLICY IF EXISTS "Providers can view care teams they are part of" ON care_teams;
DROP POLICY IF EXISTS "Primary providers can create care teams" ON care_teams;
DROP POLICY IF EXISTS "Primary providers can update care teams" ON care_teams;

CREATE POLICY "Providers can view care teams they are part of"
  ON care_teams FOR SELECT TO authenticated
  USING (
    primary_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    OR id IN (
      SELECT ctm.care_team_id FROM care_team_members ctm
      JOIN healthcare_providers hp ON ctm.provider_id = hp.id
      WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Primary providers can create care teams"
  ON care_teams FOR INSERT TO authenticated
  WITH CHECK (
    primary_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Primary providers can update care teams"
  ON care_teams FOR UPDATE TO authenticated
  USING (
    primary_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    primary_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate care_team_members policies
DROP POLICY IF EXISTS "Team members can view their care team memberships" ON care_team_members;
DROP POLICY IF EXISTS "Primary providers can add team members" ON care_team_members;
DROP POLICY IF EXISTS "Primary providers can update team members" ON care_team_members;

CREATE POLICY "Team members can view their care team memberships"
  ON care_team_members FOR SELECT TO authenticated
  USING (
    provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    OR care_team_id IN (
      SELECT ct.id FROM care_teams ct
      JOIN healthcare_providers hp ON ct.primary_provider_id = hp.id
      WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Primary providers can add team members"
  ON care_team_members FOR INSERT TO authenticated
  WITH CHECK (
    care_team_id IN (
      SELECT ct.id FROM care_teams ct
      JOIN healthcare_providers hp ON ct.primary_provider_id = hp.id
      WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Primary providers can update team members"
  ON care_team_members FOR UPDATE TO authenticated
  USING (
    care_team_id IN (
      SELECT ct.id FROM care_teams ct
      JOIN healthcare_providers hp ON ct.primary_provider_id = hp.id
      WHERE hp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    care_team_id IN (
      SELECT ct.id FROM care_teams ct
      JOIN healthcare_providers hp ON ct.primary_provider_id = hp.id
      WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate healthcare_providers policies
DROP POLICY IF EXISTS "Users can create their own provider profile" ON healthcare_providers;
DROP POLICY IF EXISTS "Users can update their own provider profile" ON healthcare_providers;

CREATE POLICY "Users can create their own provider profile"
  ON healthcare_providers FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own provider profile"
  ON healthcare_providers FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Drop and recreate user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Drop and recreate encounter_notes policies
DROP POLICY IF EXISTS "Healthcare providers can create encounter notes" ON encounter_notes;
DROP POLICY IF EXISTS "Healthcare providers can update their own encounter notes" ON encounter_notes;

CREATE POLICY "Healthcare providers can create encounter notes"
  ON encounter_notes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Healthcare providers can update their own encounter notes"
  ON encounter_notes FOR UPDATE TO authenticated
  USING (
    provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    AND is_signed = false
  )
  WITH CHECK (
    provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate problem_list policies
DROP POLICY IF EXISTS "Healthcare providers can view problem lists" ON problem_list;
DROP POLICY IF EXISTS "Healthcare providers can create problems" ON problem_list;
DROP POLICY IF EXISTS "Healthcare providers can update problems" ON problem_list;

CREATE POLICY "Healthcare providers can view problem lists"
  ON problem_list FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Healthcare providers can create problems"
  ON problem_list FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Healthcare providers can update problems"
  ON problem_list FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate medications_prescribed policies
DROP POLICY IF EXISTS "Healthcare providers can view prescriptions" ON medications_prescribed;
DROP POLICY IF EXISTS "Prescribers can create prescriptions" ON medications_prescribed;
DROP POLICY IF EXISTS "Prescribers can update their prescriptions" ON medications_prescribed;

CREATE POLICY "Healthcare providers can view prescriptions"
  ON medications_prescribed FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Prescribers can create prescriptions"
  ON medications_prescribed FOR INSERT TO authenticated
  WITH CHECK (
    prescriber_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Prescribers can update their prescriptions"
  ON medications_prescribed FOR UPDATE TO authenticated
  USING (
    prescriber_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    prescriber_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate immunizations policies
DROP POLICY IF EXISTS "Healthcare providers can create immunization records" ON immunizations;

CREATE POLICY "Healthcare providers can create immunization records"
  ON immunizations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate referrals policies
DROP POLICY IF EXISTS "Providers can view referrals they sent or received" ON referrals;
DROP POLICY IF EXISTS "Providers can create referrals" ON referrals;
DROP POLICY IF EXISTS "Providers can update referrals they sent or received" ON referrals;

CREATE POLICY "Providers can view referrals they sent or received"
  ON referrals FOR SELECT TO authenticated
  USING (
    referring_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    OR referred_to_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Providers can create referrals"
  ON referrals FOR INSERT TO authenticated
  WITH CHECK (
    referring_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Providers can update referrals they sent or received"
  ON referrals FOR UPDATE TO authenticated
  USING (
    referring_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    OR referred_to_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    referring_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    OR referred_to_provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate clinical_alerts policies
DROP POLICY IF EXISTS "Healthcare providers can view clinical alerts" ON clinical_alerts;
DROP POLICY IF EXISTS "Healthcare providers can acknowledge alerts" ON clinical_alerts;

CREATE POLICY "Healthcare providers can view clinical alerts"
  ON clinical_alerts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Healthcare providers can acknowledge alerts"
  ON clinical_alerts FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate appointments policies
DROP POLICY IF EXISTS "Users can view relevant appointments" ON appointments;
DROP POLICY IF EXISTS "Staff can create appointments" ON appointments;
DROP POLICY IF EXISTS "Staff can update appointments" ON appointments;

CREATE POLICY "Users can view relevant appointments"
  ON appointments FOR SELECT TO authenticated
  USING (
    provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    OR patient_id IN (
      SELECT p.id FROM patients p WHERE p.receptionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Staff can create appointments"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.is_active = true
      AND r.name IN ('Receptionist', 'Admin', 'System Admin')
    )
  );

CREATE POLICY "Staff can update appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (
    provider_id IN (
      SELECT hp.id FROM healthcare_providers hp WHERE hp.user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
      AND ur.is_active = true
      AND r.name IN ('Receptionist', 'Admin', 'System Admin')
    )
  )
  WITH CHECK (true);

-- =====================================================
-- PART 3: FIX FUNCTION SEARCH PATHS
-- =====================================================

DROP FUNCTION IF EXISTS get_patient_facilities(uuid);
CREATE FUNCTION get_patient_facilities(p_patient_id uuid)
RETURNS TABLE(facility_name text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT pv.facility_name
  FROM patient_visits pv
  WHERE pv.patient_id = p_patient_id
  AND pv.facility_name IS NOT NULL;
END;
$$;

DROP FUNCTION IF EXISTS has_permission(uuid, text, text);
CREATE FUNCTION has_permission(p_user_id uuid, p_resource text, p_action text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_perm boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
    AND p.resource = p_resource
    AND p.action = p_action
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$;

DROP FUNCTION IF EXISTS get_user_roles(uuid);
CREATE FUNCTION get_user_roles(p_user_id uuid)
RETURNS TABLE(role_name text, organization_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, ur.organization_id
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
  AND ur.is_active = true
  AND (ur.expires_at IS NULL OR ur.expires_at > now());
END;
$$;

DROP FUNCTION IF EXISTS log_data_access(uuid, uuid, text, text, jsonb);
CREATE FUNCTION log_data_access(
  p_user_id uuid,
  p_patient_id uuid,
  p_resource_type text,
  p_action text,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO data_access_logs (user_id, patient_id, resource_type, action, details)
  VALUES (p_user_id, p_patient_id, p_resource_type, p_action, COALESCE(p_details, '{}'::jsonb));
END;
$$;

DROP FUNCTION IF EXISTS log_security_event(text, text, text, uuid, inet, jsonb);
CREATE FUNCTION log_security_event(
  p_event_type text,
  p_severity text,
  p_description text,
  p_user_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO security_events (event_type, severity, description, user_id, ip_address, details)
  VALUES (p_event_type, p_severity, p_description, p_user_id, p_ip_address, COALESCE(p_details, '{}'::jsonb))
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

DROP FUNCTION IF EXISTS check_drug_interactions(uuid, text);
CREATE FUNCTION check_drug_interactions(p_patient_id uuid, p_new_drug_rxnorm text)
RETURNS TABLE(
  interacting_drug text,
  severity text,
  description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.medication_name,
    di.severity,
    di.description
  FROM medications_prescribed mp
  JOIN drug_interactions di ON 
    (mp.rxnorm_code = di.drug1_rxnorm AND di.drug2_rxnorm = p_new_drug_rxnorm)
    OR (mp.rxnorm_code = di.drug2_rxnorm AND di.drug1_rxnorm = p_new_drug_rxnorm)
  WHERE mp.patient_id = p_patient_id
  AND mp.status = 'Active';
END;
$$;