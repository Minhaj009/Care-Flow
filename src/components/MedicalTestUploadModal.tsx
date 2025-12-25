import { useState } from 'react';
import { X, Upload, FileText, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Patient, TestValue, FileAttachment } from '../types';
import { createMedicalTest } from '../services/databaseService';
import { uploadMultipleFiles, validateFile } from '../services/storageService';

interface MedicalTestUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  receptionistId: string;
  onSuccess: () => void;
}

export const MedicalTestUploadModal = ({
  isOpen,
  onClose,
  patient,
  receptionistId,
  onSuccess
}: MedicalTestUploadModalProps) => {
  const [testType, setTestType] = useState('');
  const [testDate, setTestDate] = useState('');
  const [labName, setLabName] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [testValues, setTestValues] = useState<TestValue[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTestValue = () => {
    setTestValues([
      ...testValues,
      { parameter: '', value: '', unit: '', referenceRange: '' }
    ]);
  };

  const handleRemoveTestValue = (index: number) => {
    setTestValues(testValues.filter((_, i) => i !== index));
  };

  const handleTestValueChange = (index: number, field: keyof TestValue, value: string) => {
    const newTestValues = [...testValues];
    newTestValues[index] = { ...newTestValues[index], [field]: value };
    setTestValues(newTestValues);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setTimeout(() => setError(null), 5000);
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!testType.trim()) {
      setError('Test type is required');
      return;
    }

    if (!testDate) {
      setError('Test date is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const testId = crypto.randomUUID();

      let fileAttachments: FileAttachment[] = [];
      if (selectedFiles.length > 0) {
        fileAttachments = await uploadMultipleFiles(
          selectedFiles,
          receptionistId,
          patient.id,
          testId
        );
      }

      const filteredTestValues = testValues.filter(tv => tv.parameter && tv.value);

      await createMedicalTest(
        {
          id: testId,
          patient_id: patient.id,
          test_type: testType,
          test_date: testDate,
          lab_name: labName,
          test_values: filteredTestValues,
          doctor_notes: doctorNotes,
          file_attachments: fileAttachments
        },
        receptionistId
      );

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to upload test:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTestType('');
    setTestDate('');
    setLabName('');
    setDoctorNotes('');
    setTestValues([]);
    setSelectedFiles([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Upload Test Results</h2>
            <p className="text-blue-100">Patient: {patient.full_name}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  placeholder="e.g., Blood Test, X-Ray, MRI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Laboratory/Facility Name
              </label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="e.g., City Lab, Radiology Center"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Test Values (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleAddTestValue}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Value
                </button>
              </div>

              <div className="space-y-3">
                {testValues.map((tv, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <input
                      type="text"
                      value={tv.parameter}
                      onChange={(e) => handleTestValueChange(index, 'parameter', e.target.value)}
                      placeholder="Parameter"
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="text"
                      value={tv.value}
                      onChange={(e) => handleTestValueChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="text"
                      value={tv.unit}
                      onChange={(e) => handleTestValueChange(index, 'unit', e.target.value)}
                      placeholder="Unit"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="text"
                      value={tv.referenceRange}
                      onChange={(e) => handleTestValueChange(index, 'referenceRange', e.target.value)}
                      placeholder="Reference Range"
                      className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTestValue(index)}
                      className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor's Notes
              </label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Any observations, recommendations, or notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop files or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Supported: PDF, JPG, PNG (Max 10MB per file)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Select Files
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Files ({selectedFiles.length})
                  </p>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
