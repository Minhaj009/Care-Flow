/*
  # Create Storage Bucket for Medical Documents

  ## Overview
  This migration creates a Supabase Storage bucket for storing medical documents
  including scanned reports, test results, images, and patient photos.

  ## Changes Made

  ### 1. Storage Bucket
  - Create `medical-documents` bucket
  - Set as private (not publicly accessible)
  - Configure file size limits and allowed types

  ### 2. Storage Policies
  - Users can upload files to their own folder (receptionist_id based)
  - Users can read files they uploaded
  - Users can delete files they uploaded
  - File path structure: {receptionist_id}/{patient_id}/{test_id}/{filename}

  ## Important Notes
  - Maximum file size: 10MB per file
  - Allowed types: PDF, JPG, JPEG, PNG
  - All file access requires authentication
  - Files are organized by receptionist and patient for easy management
*/

-- Create the medical-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-documents',
  'medical-documents',
  false,
  10485760, -- 10MB in bytes
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files to their own folder
DROP POLICY IF EXISTS "Users can upload medical documents" ON storage.objects;
CREATE POLICY "Users can upload medical documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'medical-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to view their own files
DROP POLICY IF EXISTS "Users can view own medical documents" ON storage.objects;
CREATE POLICY "Users can view own medical documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'medical-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to update their own files
DROP POLICY IF EXISTS "Users can update own medical documents" ON storage.objects;
CREATE POLICY "Users can update own medical documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'medical-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'medical-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Users can delete own medical documents" ON storage.objects;
CREATE POLICY "Users can delete own medical documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'medical-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );