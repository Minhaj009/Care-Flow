import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/DashboardHeader';
import { RecordingInterface } from '../components/RecordingInterface';
import { RecentCheckIns } from '../components/RecentCheckIns';
import { processTranscriptWithGemini } from '../services/geminiService';
import { savePatientVisit, getRecentVisits, deletePatientVisit } from '../services/databaseService';
import { PatientVisit } from '../types';
import { supabase } from '../lib/supabase';
import { useProfile } from '../contexts/ProfileContext';
import type { User } from '@supabase/supabase-js';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [user, setUser] = useState<User | null>(null);
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadRecentVisits = async () => {
    try {
      setIsLoading(true);
      const recentVisits = await getRecentVisits(10);
      setVisits(recentVisits);
    } catch (error) {
      console.error('Error loading visits:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load recent check-ins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRecentVisits();
    }
  }, [user]);

  const handleDeleteVisit = async (visitId: string) => {
    setVisits((prev) => prev.filter((v) => v.id !== visitId));

    try {
      await deletePatientVisit(visitId);
    } catch (error) {
      console.error('Error deleting visit:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete visit');
      await loadRecentVisits();
    }
  };

  const handleTranscriptComplete = async (transcript: string) => {
    if (!user) {
      setErrorMessage('You must be logged in to save patient check-ins');
      return;
    }

    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    console.log("=== HANDLING TRANSCRIPT ===");
    console.log("Transcript received:", transcript);

    try {
      const aiJson = await processTranscriptWithGemini(transcript);
      console.log("AI Extracted Data:", aiJson);

      await savePatientVisit(transcript, aiJson, user.id);
      console.log("Saved to database successfully");

      setSuccessMessage('Patient check-in saved successfully!');

      await loadRecentVisits();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Error processing check-in:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process check-in');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Patient Check-in</h1>
              <p className="text-slate-600 mt-1">
                Clinic: <span className="font-semibold text-slate-900">{profile?.clinic_name || 'Loading...'}</span>
              </p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8">
          <RecordingInterface onTranscriptComplete={handleTranscriptComplete} isProcessing={isProcessing} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <RecentCheckIns visits={visits} isLoading={isLoading} onDelete={handleDeleteVisit} />
        </div>
      </main>
    </div>
  );
};
