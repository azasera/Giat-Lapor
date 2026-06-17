import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './services/supabaseService';
import AuthForm from './components/AuthForm';
import ResetPasswordForm from './components/ResetPasswordForm';
const IslamicPrincipalReportApp = lazy(() => import('./components/IslamicPrincipalReportApp'));
const RABPage = lazy(() => import('./pages/RABPage'));
const ViewReportPage = lazy(() => import('./pages/ViewReportPage'));
const TahfidzSupervisionSchedulePage = lazy(() => import('./pages/TahfidzSupervisionSchedulePage'));
const TahfidzAnnualSchedulePage = lazy(() => import('./pages/TahfidzAnnualSchedulePage'));
const TahfidzSupervisionListPage = lazy(() => import('./pages/TahfidzSupervisionListPage'));
const TahfidzSupervisionFormPage = lazy(() => import('./pages/TahfidzSupervisionFormPage'));
const TahfidzSupervisionViewPage = lazy(() => import('./pages/TahfidzSupervisionViewPage'));
const FoundationTahfidzReportPage = lazy(() => import('./pages/FoundationTahfidzReportPage'));
const TeacherManagementPage = lazy(() => import('./pages/TeacherManagementPage'));
const TeachersUploadPage = lazy(() => import('./pages/TeachersUploadPage'));


const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
  </div>
);

// Component to log current route location
const RouteLogger = () => {
  const location = useLocation();
  useEffect(() => {
    console.log('[App] Current route location:', location.pathname);
  }, [location]);
  return null;
};

const renderProtected = (Component: any, session: Session | null) => {
  if (!session) {
    return <AuthForm onAuthSuccess={() => { }} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
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

      console.log('URL hash:', window.location.hash);
      console.log('Recovery type:', type);
      console.log('Access token present:', !!accessToken);

      // Check for recovery type even without access token (for manual testing)
      if (type === 'recovery') {
        console.log('Password recovery detected from URL');
        setIsPasswordRecovery(true);

        if (accessToken) {
          // Get the session which Supabase auto-creates from the recovery token
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting recovery session:', error);
          } else {
            console.log('Recovery session created, will sign out after password reset');
            setSession(data.session);
          }
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

  // Enable global click-and-drag scrolling for overflow-x-auto elements
  useEffect(() => {
    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    let activeEl: HTMLElement | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignore click-and-drag if clicking interactive elements
      if (
        ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(target.tagName) || 
        target.isContentEditable || 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('input') || 
        target.closest('select') || 
        target.closest('textarea')
      ) {
        return;
      }

      const container = target.closest('.overflow-x-auto') as HTMLElement;
      if (!container) return;

      // Only scroll if container is actually overflowing horizontally
      if (container.scrollWidth <= container.clientWidth) return;

      isDown = true;
      activeEl = container;
      activeEl.style.cursor = 'grabbing';
      activeEl.style.userSelect = 'none';
      startX = e.pageX - activeEl.offsetLeft;
      scrollLeft = activeEl.scrollLeft;
    };

    const handleMouseLeave = () => {
      if (!isDown || !activeEl) return;
      isDown = false;
      activeEl.style.cursor = 'grab';
      activeEl.style.removeProperty('user-select');
      activeEl = null;
    };

    const handleMouseUp = () => {
      if (!isDown || !activeEl) return;
      isDown = false;
      activeEl.style.cursor = 'grab';
      activeEl.style.removeProperty('user-select');
      activeEl = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown || !activeEl) return;
      e.preventDefault();
      const x = e.pageX - activeEl.offsetLeft;
      const walk = (x - startX) * 1.5;
      activeEl.scrollLeft = scrollLeft - walk;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const container = target.closest('.overflow-x-auto') as HTMLElement;
      if (container) {
        if (container.scrollWidth > container.clientWidth) {
          if (!isDown) {
            container.style.cursor = 'grab';
          }
        } else {
          container.style.cursor = '';
        }
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
    };
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
          path="/reset-password"
          element={<ResetPasswordForm />}
        />
        <Route
          path="/rab" // New route for RABPage
          element={renderProtected(RABPage, session)}
        />
        <Route
          path="/reports/:reportId" // New route for ViewReportPage
          element={renderProtected(ViewReportPage, session)}
        />
        <Route
          path="/tahfidz-supervision-schedule"
          element={renderProtected(TahfidzSupervisionSchedulePage, session)}
        />
        <Route
          path="/tahfidz-annual-schedule"
          element={renderProtected(TahfidzAnnualSchedulePage, session)}
        />
        <Route
          path="/teachers"
          element={renderProtected(TeacherManagementPage, session)}
        />
        <Route
          path="/teachers/upload"
          element={renderProtected(TeachersUploadPage, session)}
        />
        <Route
          path="/tahfidz-supervision"
          element={renderProtected(TahfidzSupervisionListPage, session)}
        />
        <Route
          path="/tahfidz-supervision/new"
          element={renderProtected(TahfidzSupervisionFormPage, session)}
        />
        <Route
          path="/tahfidz-supervision/edit/:id"
          element={renderProtected(TahfidzSupervisionFormPage, session)}
        />
        <Route
          path="/tahfidz-supervision/view/:id"
          element={renderProtected(TahfidzSupervisionViewPage, session)}
        />
        <Route
          path="/tahfidz-foundation-reports"
          element={renderProtected(FoundationTahfidzReportPage, session)}
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
              <Suspense fallback={<LoadingFallback />}>
                <IslamicPrincipalReportApp session={session} />
              </Suspense>
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;