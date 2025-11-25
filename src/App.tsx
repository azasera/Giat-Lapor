import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './services/supabaseService';
import IslamicPrincipalReportApp from './components/IslamicPrincipalReportApp';
import AuthForm from './components/AuthForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import RABPage from './pages/RABPage'; // Import RABPage
import ViewReportPage from './pages/ViewReportPage'; // Import ViewReportPage
import TahfidzSupervisionSchedulePage from './pages/TahfidzSupervisionSchedulePage';
import TahfidzAnnualSchedulePage from './pages/TahfidzAnnualSchedulePage';
import TahfidzSupervisionListPage from './pages/TahfidzSupervisionListPage';
import TahfidzSupervisionFormPage from './pages/TahfidzSupervisionFormPage';
import TahfidzSupervisionViewPage from './pages/TahfidzSupervisionViewPage';
import FoundationTahfidzReportPage from './pages/FoundationTahfidzReportPage';
import TeacherManagementPage from './pages/TeacherManagementPage';
import TeachersUploadPage from './pages/TeachersUploadPage';


// Component to log current route location
const RouteLogger = () => {
  const location = useLocation();
  useEffect(() => {
    console.log('[App] Current route location:', location.pathname);
  }, [location]);
  return null;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Handle password recovery from URL hash
    const handlePasswordRecovery = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');

      if (type === 'recovery' && accessToken) {
        console.log('Password recovery detected from URL');

        // Set password recovery mode first
        setIsPasswordRecovery(true);

        // Get the session which Supabase auto-creates from the recovery token
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting recovery session:', error);
        } else {
          console.log('Recovery session created, will sign out after password reset');
          setSession(data.session);
        }
        setLoading(false);
      } else {
        // Normal session check
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setLoading(false);
        });
      }
    };

    handlePasswordRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      console.log('Auth state changed:', event, session);

      // Detect password recovery events
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected in onAuthStateChange');
        setIsPasswordRecovery(true);
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
        setSession(null);
      } else {
        setSession(session);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <RouteLogger /> {/* Add RouteLogger here */}
      <Routes>
        <Route
          path="/rab" // New route for RABPage
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <RABPage />
            )
          }
        />
        <Route
          path="/reports/:reportId" // New route for ViewReportPage
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <ViewReportPage />
            )
          }
        />
        <Route
          path="/tahfidz-supervision-schedule"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TahfidzSupervisionSchedulePage />
            )
          }
        />
        <Route
          path="/tahfidz-annual-schedule"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TahfidzAnnualSchedulePage />
            )
          }
        />
        <Route
          path="/teachers"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TeacherManagementPage />
            )
          }
        />
        <Route
          path="/teachers"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TeacherManagementPage />
            )
          }
        />
        <Route
          path="/teachers/upload"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TeachersUploadPage />
            )
          }
        />
        <Route
          path="/tahfidz-supervision"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TahfidzSupervisionListPage />
            )
          }
        />
        <Route
          path="/tahfidz-supervision/new"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TahfidzSupervisionFormPage />
            )
          }
        />
        <Route
          path="/tahfidz-supervision/edit/:id"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TahfidzSupervisionFormPage />
            )
          }
        />
        <Route
          path="/tahfidz-supervision/view/:id"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <TahfidzSupervisionViewPage />
            )
          }
        />
        <Route
          path="/tahfidz-foundation-reports"
          element={
            !session ? (
              <AuthForm onAuthSuccess={() => { }} />
            ) : (
              <FoundationTahfidzReportPage />
            )
          }
        />
        <Route
          path="*"
          element={
            isPasswordRecovery ? (
              <ResetPasswordForm />
            ) : !session ? (
              <AuthForm onAuthSuccess={() => {
                // After successful auth, the onAuthStateChange listener will update the session state
                // and trigger a re-render, showing the main app.
              }} />
            ) : (
              <IslamicPrincipalReportApp session={session} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;