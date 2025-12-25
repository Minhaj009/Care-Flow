import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Auth } from './components/Auth';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { ProblemList } from './pages/ProblemList';
import { Medications } from './pages/Medications';
import { Immunizations } from './pages/Immunizations';
import { Referrals } from './pages/Referrals';
import { EncounterNotes } from './pages/EncounterNotes';
import { LabResults } from './pages/LabResults';
import { Settings } from './pages/Settings';
import { EHRInfo } from './pages/EHRInfo';
import { ProfileProvider } from './contexts/ProfileContext';

function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/ehr-info" element={<Layout><EHRInfo /></Layout>} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <Patients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problem-list"
            element={
              <ProtectedRoute>
                <ProblemList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medications"
            element={
              <ProtectedRoute>
                <Medications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/immunizations"
            element={
              <ProtectedRoute>
                <Immunizations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/encounter-notes"
            element={
              <ProtectedRoute>
                <EncounterNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-results"
            element={
              <ProtectedRoute>
                <LabResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ProfileProvider>
    </BrowserRouter>
  );
}

export default App;
