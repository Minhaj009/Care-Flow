import { supabase } from '../lib/supabase';
import { FileAttachment } from '../types';

const BUCKET_NAME = 'medical-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: PDF, JPG, PNG`
    };
  }

  return { valid: true };
};

export const uploadFile = async (
  file: File,
  receptionistId: string,
  patientId: string,
  testId: string,
  onProgress?: (progress: number) => void
): Promise<FileAttachment> => {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${receptionistId}/${patientId}/${testId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  if (onProgress) {
    onProgress(100);
  }

  const fileAttachment: FileAttachment = {
    id: crypto.randomUUID(),
    fileName: file.name,
    filePath: data.path,
    fileType: file.type,
    fileSize: file.size,
    uploadedAt: new Date().toISOString()
  };

  return fileAttachment;
};

export const uploadMultipleFiles = async (
  files: File[],
  receptionistId: string,
  patientId: string,
  testId: string,
  onProgress?: (fileName: string, progress: number) => void
): Promise<FileAttachment[]> => {
  const uploadPromises = files.map(file =>
    uploadFile(file, receptionistId, patientId, testId, (progress) => {
      if (onProgress) {
        onProgress(file.name, progress);
      }
    })
  );

  return Promise.all(uploadPromises);
};

export const downloadFile = async (filePath: string): Promise<Blob> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  return data;
};

export const getFileUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteFile = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

export const deleteMultipleFiles = async (filePaths: string[]): Promise<void> => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

export const getSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
};
