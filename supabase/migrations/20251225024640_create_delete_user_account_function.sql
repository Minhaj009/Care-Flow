/*
  # Create delete user account function

  1. New Functions
    - `delete_user_account()` - Securely deletes the authenticated user's account and all associated data

  2. Security
    - Function runs with SECURITY DEFINER to allow deletion of auth user
    - Only allows users to delete their own account
    - Cascades deletion to all user-owned data

  3. Important Notes
    - Deletes all patient_visits records associated with the user
    - Deletes the user's profile record
    - Deletes the user from auth.users (requires SECURITY DEFINER)
    - This action is permanent and cannot be undone
*/

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM patient_visits WHERE receptionist_id = current_user_id;

  DELETE FROM profiles WHERE id = current_user_id;

  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;
