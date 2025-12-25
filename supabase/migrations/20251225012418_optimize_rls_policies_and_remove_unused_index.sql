/*
  # Optimize RLS Policies and Remove Unused Index

  ## Overview
  This migration optimizes Row Level Security (RLS) policies by wrapping auth.uid() 
  calls in SELECT statements to prevent re-evaluation for each row, significantly 
  improving query performance at scale.

  ## Changes Made

  ### 1. Patient Visits Table Policies
  - Drop existing policies: `receptionist_insert_own`, `receptionist_select_own`, `receptionist_delete_own`
  - Recreate with optimized syntax using `(select auth.uid())`
  - **Performance Impact**: Prevents re-evaluation of auth.uid() for each row

  ### 2. Profiles Table Policies
  - Drop existing policies: `Users can view own profile`, `Users can insert own profile`, `Users can update own profile`
  - Recreate with optimized syntax using `(select auth.uid())`
  - **Performance Impact**: Prevents re-evaluation of auth.uid() for each row

  ### 3. Remove Unused Index
  - Drop `patient_visits_receptionist_id_idx` as it is not being used by queries
  - **Note**: The foreign key constraint automatically creates an index, so this was redundant

  ## Security Impact
  - No change to security model - policies maintain same access controls
  - Only performance optimizations applied

  ## References
  - [Supabase RLS Performance Docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
*/

-- ============================================================================
-- PATIENT VISITS TABLE - OPTIMIZE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "receptionist_insert_own" ON patient_visits;
DROP POLICY IF EXISTS "receptionist_select_own" ON patient_visits;
DROP POLICY IF EXISTS "receptionist_delete_own" ON patient_visits;

-- Recreate policies with optimized auth.uid() calls

CREATE POLICY "receptionist_insert_own"
  ON patient_visits
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = receptionist_id);

CREATE POLICY "receptionist_select_own"
  ON patient_visits
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = receptionist_id);

CREATE POLICY "receptionist_delete_own"
  ON patient_visits
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = receptionist_id);

-- ============================================================================
-- PROFILES TABLE - OPTIMIZE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate policies with optimized auth.uid() calls

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- REMOVE UNUSED INDEX
-- ============================================================================

DROP INDEX IF EXISTS patient_visits_receptionist_id_idx;