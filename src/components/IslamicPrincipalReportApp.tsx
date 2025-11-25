import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, Send, FileText, BarChart3, Moon, Sun, Download, CheckCircle, Calendar, TrendingUp, CalendarDays, Clock, MapPin, LogOut, Award, DollarSign, Eye, Users, Menu, X, ChevronLeft, ChevronRight, User, UserCircle } from 'lucide-react'; // Added User, UserCircle icons
import { Session } from '@supabase/supabase-js';
import { supabase, fetchUserProfile, fetchReports, saveReportToSupabase, deleteReportFromSupabase, createProfileForNewUser } from '../services/supabaseService';
import GoogleAuth from './GoogleAuth';
import { googleService } from '../services/googleService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast'; // Import toast utilities

// Import page components
import DashboardPage from '../pages/DashboardPage';
import CreateReportPage from '../pages/CreateReportPage';
import ReportsPage from '../pages/ReportsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import FoundationEvaluationPage from '../pages/FoundationEvaluationPage';
import RABPage from '../pages/RABPage'; // Import RABPage
import RABListPage from '../pages/RABListPage'; // Import RABListPage
import RABRealizationPage from '../pages/RABRealizationPage'; // Import RABRealizationPage
import RABRealizationListPage from '../pages/RABRealizationListPage'; // Import RABRealizationListPage
import UsersPage from '../pages/UsersPage'; // Import UsersPage
// ViewReportPage is now rendered directly by App.tsx router, so no need to import here

// Import types and constants
import { ReportData, Activity, Achievement, DetailedEvaluationItem, allDetailedEvaluationItems, activityCategories } from '../types/report';
import { defaultRABData, RABData as RABDataType } from '../types/rab'; // Import RABData as RABDataType to avoid conflict

interface IslamicPrincipalReportAppProps {
  session: Session;
}

const IslamicPrincipalReportApp: React.FC<IslamicPrincipalReportAppProps> = ({ session }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'reports' | 'analytics' | 'foundation-evaluation' | 'rab-list' | 'rab-form' | 'realization-list' | 'realization-form' | 'users'>('dashboard'); // Added realization views
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar collapse - default false for mobile
  const [reports, setReports] = useState<ReportData[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportData>({
    id: '', // ID kosong menandakan laporan baru
    date: new Date().toISOString().split('T')[0],
    principalName: '',
    schoolName: '',
    period: '',
    activities: [],
    achievements: [],
    challenges: [],
    plans: [],
    principalEvaluation: {}, // Menggunakan principalEvaluation
    foundationEvaluation: {}, // Menambahkan foundationEvaluation
    status: 'draft'
  });
  // const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Replaced by toast
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [userRole, setUserRole] = useState<'principal' | 'foundation' | 'admin'>('principal'); // Default role, now includes 'admin'
  const [userProfile, setUserProfile] = useState<{ username: string; full_name: string; email: string } | null>(null); // User profile info
  const [currentRABId, setCurrentRABId] = useState<string | undefined>(undefined); // State to hold RAB ID for editing
  const [currentRealizationId, setCurrentRealizationId] = useState<string | undefined>(undefined); // State for realization editing
  const [selectedRABForRealization, setSelectedRABForRealization] = useState<string | undefined>(undefined); // RAB ID for new realization
  // const [selectedReportIdForView, setSelectedReportIdForView] = useState<string | null>(null); // Removed: ViewReportPage gets ID from URL

  const navigate = useNavigate(); // Initialize useNavigate

  // --- Callback Functions (Defined before useEffects that use them) ---

  const resetForm = useCallback(() => {
    setCurrentReport({
      id: '', // Reset ID untuk laporan baru
      date: new Date().toISOString().split('T')[0],
      principalName: '',
      schoolName: '',
      period: '',
      activities: [],
      achievements: [],
      challenges: [],
      plans: [],
      principalEvaluation: {}, // Menggunakan principalEvaluation
      foundationEvaluation: {}, // Menambahkan foundationEvaluation
      status: 'draft'
    });
  }, []);

  // Fungsi untuk menghitung rata-rata kinerja dari objek evaluasi detail
  const getAverageEvaluationScore = useCallback((evaluation: { [itemId: string]: number }) => {
    const scores = Object.values(evaluation);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, []);

  const saveReport = useCallback(async () => {
    if (!session?.user?.id) {
      showError('Anda harus login untuk menyimpan laporan.');
      return;
    }
    const loadingToastId = showLoading('Menyimpan laporan...');
    setIsLoading(true);
    try {
      const saved = await saveReportToSupabase(currentReport, session.user.id);
      setReports(prev => {
        // Check if this is an update of existing report
        const existingIndex = prev.findIndex(r => r.id === saved.id);
        if (existingIndex > -1) {
          // Update existing report
          const updatedReports = [...prev];
          updatedReports[existingIndex] = saved;
          console.log(`Updated existing report at index ${existingIndex}`);
          return updatedReports;
        }

        // Check if we're updating a report that had a temporary ID
        if (currentReport.id && currentReport.id !== saved.id) {
          const tempIndex = prev.findIndex(r => r.id === currentReport.id);
          if (tempIndex > -1) {
            // Replace the temporary report with the saved one
            const updatedReports = [...prev];
            updatedReports[tempIndex] = saved;
            console.log(`Replaced temporary report at index ${tempIndex} with saved report`);
            return updatedReports;
          }
        }

        // Add new report to the beginning
        console.log(`Adding new report to list`);
        return [saved, ...prev];
      });
      setCurrentReport(saved); // Update currentReport with the saved version (with ID)
      showSuccess('Laporan berhasil disimpan sebagai draft!');
    } catch (error) {
      console.error('Gagal menyimpan laporan:', error);
      showError('Gagal menyimpan laporan. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsLoading(false);
    }
  }, [currentReport, session]);

  const submitReport = useCallback(async () => {
    if (!session?.user?.id) {
      showError('Anda harus login untuk mengirim laporan.');
      return;
    }
    if (!currentReport.principalName || !currentReport.schoolName || !currentReport.period || currentReport.activities.length === 0) {
      showError('Harap lengkapi semua informasi dasar dan tambahkan setidaknya satu kegiatan sebelum mengirim.');
      return;
    }
    // Removed the validation for principalEvaluation items
    // const unscoredItems = allDetailedEvaluationItems.filter(item => !currentReport.principalEvaluation[item.id]);
    // if (unscoredItems.length > 0) {
    //   showError(`Harap lengkapi semua item penilaian kinerja. Ada ${unscoredItems.length} item yang belum dinilai.`);
    //   return;
    // }

    const loadingToastId = showLoading('Mengirim laporan...');
    setIsLoading(true);
    try {
      const submittedReport = {
        ...currentReport,
        status: 'submitted' as 'submitted',
        submittedAt: new Date().toISOString(),
      };
      const saved = await saveReportToSupabase(submittedReport, session.user.id);
      setReports(prev => {
        const existingIndex = prev.findIndex(r => r.id === saved.id);
        if (existingIndex > -1) {
          const updatedReports = [...prev];
          updatedReports[existingIndex] = saved;
          return updatedReports;
        }
        return [saved, ...prev];
      });
      setCurrentReport(saved);
      showSuccess('Laporan berhasil dikirim ke yayasan!');
    } catch (error) {
      console.error('Gagal mengirim laporan:', error);
      showError('Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsLoading(false);
    }
  }, [currentReport, session]);

  // Force refresh function for data synchronization
  const forceRefreshReports = useCallback(async () => {
    if (session?.user?.id) {
      console.log('Force refreshing reports for all users...');
      const loadingToastId = showLoading('Menyinkronkan laporan...');
      setIsLoading(true);
      try {
        const fetchedReports = await fetchReports(session.user.id, userRole);
        setReports(fetchedReports);
        showSuccess('Laporan berhasil disinkronkan!');
        console.log(`Force refresh complete: ${fetchedReports.length} reports loaded`);
      } catch (error) {
        console.error('Error during force refresh:', error);
        showError('Gagal menyinkronkan laporan.');
      } finally {
        dismissToast(loadingToastId);
        setIsLoading(false);
      }
    }
  }, [session, userRole]);

  const deleteReport = useCallback(async (reportId: string) => {
    if (!session?.user?.id) {
      showError('Anda harus login untuk menghapus laporan.');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      return;
    }

    const loadingToastId = showLoading('Menghapus laporan...');
    setIsLoading(true);
    try {
      console.log(`Starting deletion of report ${reportId}`);

      // Hapus dari database terlebih dahulu
      await deleteReportFromSupabase(reportId);
      console.log(`Report ${reportId} deleted from database`);

      // Force refresh untuk memastikan sinkronisasi data di semua user
      await forceRefreshReports();

      // Jika laporan yang dihapus adalah yang sedang diedit, reset form
      if (currentReport.id === reportId) {
        console.log(`Resetting form as deleted report was being edited`);
        resetForm();
      }

      showSuccess('Laporan berhasil dihapus dan data telah disinkronkan!');
    } catch (error) {
      console.error('Gagal menghapus laporan:', error);
      showError('Gagal menghapus laporan. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsLoading(false);
    }
  }, [session, currentReport.id, resetForm, forceRefreshReports]);

  const exportToGoogleSheets = useCallback(async () => {
    if (!isGoogleSignedIn) {
      showError('Silakan masuk ke Google terlebih dahulu untuk mengekspor data.');
      return;
    }
    if (reports.length === 0) {
      showError('Tidak ada laporan untuk diekspor.');
      return;
    }

    const loadingToastId = showLoading('Mengekspor data ke Google Sheets...');
    setIsLoading(true);
    try {
      const spreadsheetId = await googleService.exportReportToSheets(reports);
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      showSuccess(`Data berhasil diekspor ke Google Sheets!`);

      // Open the spreadsheet in a new tab
      window.open(spreadsheetUrl, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Gagal mengekspor data ke Google Sheets. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsLoading(false);
    }
  }, [isGoogleSignedIn, reports]);

  const handleReportUpdated = useCallback(() => {
    // This callback is passed to FoundationEvaluationPage to trigger a re-fetch of reports
    // after an evaluation is saved or rejected.
    const loadReports = async () => {
      if (session?.user?.id) {
        setIsLoading(true);
        const fetchedReports = await fetchReports(session.user.id, userRole);
        setReports(fetchedReports);
        setIsLoading(false);
      }
    };
    loadReports();
  }, [session, userRole]);

  // --- RAB Specific Callbacks ---
  const handleCreateNewRAB = useCallback(() => {
    setCurrentRABId(undefined); // Clear current RAB ID for new form
    setCurrentView('rab-form');
  }, []);

  const handleEditRAB = useCallback((rabId: string) => {
    setCurrentRABId(rabId);
    setCurrentView('rab-form');
  }, []);

  const handleRABSaved = useCallback(() => {
    setCurrentView('rab-list'); // Go back to list after saving
  }, []);

  // --- Realization Specific Callbacks ---
  const handleCreateNewRealization = useCallback((rabId: string) => {
    setSelectedRABForRealization(rabId);
    setCurrentRealizationId(undefined);
    setCurrentView('realization-form');
  }, []);

  const handleEditRealization = useCallback((realizationId: string) => {
    setCurrentRealizationId(realizationId);
    setSelectedRABForRealization(undefined);
    setCurrentView('realization-form');
  }, []);

  const handleRealizationSaved = useCallback(() => {
    setCurrentView('realization-list');
  }, []);

  // --- View Report Specific Callbacks ---
  const handleViewReport = useCallback((reportId: string) => {
    // setSelectedReportIdForView(reportId); // Removed
    // setCurrentView('view-report'); // Removed
    navigate(`/reports/${reportId}`); // Navigate to the new route
  }, [navigate]);

  // --- Effects ---

  // Effect to apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Effect to fetch user role and reports from Supabase
  useEffect(() => {
    const loadInitialData = async () => { // Renamed to emphasize initial load
      console.log('=== LOADING INITIAL DATA ===', new Date().toISOString());
      setIsLoading(true);
      if (session?.user?.id) {
        console.log('Session user ID:', session.user.id);

        // Fetch user profile to get role
        let profile = await fetchUserProfile(session.user.id);
        if (!profile) {
          console.log('Profile not found for user, creating a new one.');
          // Create a default profile if it doesn't exist
          try {
            profile = await createProfileForNewUser(session.user.id, session.user.email || '');
            console.log('Default profile created.');
          } catch (createError) {
            console.error('Failed to create default profile:', createError);
            showError('Gagal membuat profil pengguna. Silakan coba lagi.');
          }
        }

        if (profile) {
          console.log('User role set to:', profile.role);
          setUserRole(profile.role as 'principal' | 'foundation' | 'admin'); // Update type here
          // Set user profile info
          setUserProfile({
            username: profile.username || session.user.email?.split('@')[0] || 'User',
            full_name: profile.full_name || session.user.email || 'User',
            email: session.user.email || ''
          });
        }

        // Fetch reports based on user role
        console.log('Fetching reports...');
        const fetchedReports = await fetchReports(session.user.id, profile?.role as 'principal' | 'foundation' | 'admin' || 'principal'); // Update type here
        console.log('Setting reports to state:', fetchedReports.length, 'reports');
        setReports(fetchedReports);
      }
      console.log('=== INITIAL DATA LOADING COMPLETE ===');
      setIsLoading(false);
    };

    loadInitialData(); // Call once on mount/session change

    // Listen for changes in reports table (realtime)
    const reportsSubscription = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, payload => {
        console.log('Realtime Change received!', payload);
        if (payload.eventType === 'DELETE') {
          // Pastikan penghapusan langsung dan tidak ada delay
          const deletedReportId = payload.old?.id;
          if (deletedReportId) {
            console.log(`Removing report ${deletedReportId} from state due to DELETE event`);
            setReports(prevReports => {
              const filtered = prevReports.filter(report => report.id !== deletedReportId);
              console.log(`Reports count: ${prevReports.length} -> ${filtered.length}`);
              return filtered;
            });

            // Reset form jika laporan yang dihapus sedang diedit
            setCurrentReport(prevReport => {
              if (prevReport.id === deletedReportId) {
                console.log(`Resetting form because deleted report was being edited`);
                return {
                  id: '',
                  date: new Date().toISOString().split('T')[0],
                  principalName: '',
                  schoolName: '',
                  period: '',
                  activities: [],
                  achievements: [],
                  challenges: [],
                  plans: [],
                  principalEvaluation: {}, // Menggunakan principalEvaluation
                  foundationEvaluation: {}, // Menambahkan foundationEvaluation
                  status: 'draft' as const
                };
              }
              return prevReport;
            });
          }
        } else if (payload.eventType === 'INSERT') {
          // Untuk insert, ambil laporan lengkap dengan data bersarang
          const newReportId = payload.new.id;
          if (newReportId) {
            supabase.from('reports')
              .select(`*, activities (*), achievements (*)`)
              .eq('id', newReportId)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  const mappedReport = {
                    id: data.id,
                    date: data.report_date,
                    principalName: data.principal_name,
                    schoolName: data.school_name,
                    period: data.period,
                    activities: (data.activities || []).map((activity: any) => ({
                      id: activity.id, category: activity.category, title: activity.title, description: activity.description,
                      date: activity.activity_date, time: activity.time, location: activity.location, involvedParties: activity.involved_parties,
                      participants: activity.participants, outcome: activity.outcome, islamicValue: activity.islamic_value,
                      goals: activity.goals, results: activity.results, impact: activity.impact, challenges: activity.challenges,
                      solutions: activity.solutions, followUpPlan: activity.follow_up_plan, documentationLink: activity.documentation_link,
                      attachmentLink: activity.attachment_link, additionalNotes: activity.additional_notes,
                    })),
                    achievements: (data.achievements || []).map((achievement: any) => ({
                      id: achievement.id, title: achievement.title, description: achievement.description,
                      impact: achievement.impact, evidence: achievement.evidence,
                    })),
                    challenges: [], plans: [],
                    principalEvaluation: data.principal_evaluation || {}, // Map new field
                    foundationEvaluation: data.foundation_evaluation || {}, // Map new field
                    submittedAt: data.submitted_at,
                    status: data.status as 'draft' | 'submitted' | 'approved',
                  };
                  setReports(prevReports => [mappedReport, ...prevReports.filter(r => r.id !== mappedReport.id)]);
                } else {
                  console.error('Error fetching new report for realtime insert:', error);
                }
              });
          }
        } else if (payload.eventType === 'UPDATE') {
          // Untuk update, ambil laporan lengkap untuk mendapatkan data bersarang
          const updatedReportId = payload.new.id;
          if (updatedReportId) {
            supabase.from('reports')
              .select(`*, activities (*), achievements (*)`)
              .eq('id', updatedReportId)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  const mappedReport = {
                    id: data.id,
                    date: data.report_date,
                    principalName: data.principal_name,
                    schoolName: data.school_name,
                    period: data.period,
                    activities: (data.activities || []).map((activity: any) => ({
                      id: activity.id, category: activity.category, title: activity.title, description: activity.description,
                      date: activity.activity_date, time: activity.time, location: activity.location, involvedParties: activity.involved_parties,
                      participants: activity.participants, outcome: activity.outcome, islamicValue: activity.islamic_value,
                      goals: activity.goals, results: activity.results, impact: activity.impact, challenges: activity.challenges,
                      solutions: activity.solutions, followUpPlan: activity.follow_up_plan, documentationLink: activity.documentation_link,
                      attachmentLink: activity.attachment_link, additionalNotes: activity.additional_notes,
                    })),
                    achievements: (data.achievements || []).map((achievement: any) => ({
                      id: achievement.id, title: achievement.title, description: achievement.description,
                      impact: achievement.impact, evidence: achievement.evidence,
                    })),
                    challenges: [], plans: [],
                    principalEvaluation: data.principal_evaluation || {}, // Map new field
                    foundationEvaluation: data.foundation_evaluation || {}, // Map new field
                    submittedAt: data.submitted_at,
                    status: data.status as 'draft' | 'submitted' | 'approved',
                  };
                  setReports(prevReports => prevReports.map(r => r.id === mappedReport.id ? mappedReport : r));
                  // Jika laporan yang diperbarui adalah yang sedang diedit, perbarui currentReport juga
                  setCurrentReport(prevReport => {
                    if (prevReport.id === mappedReport.id) {
                      return mappedReport;
                    }
                    return prevReport;
                  });
                } else {
                  console.error('Error fetching updated report for realtime update:', error);
                }
              });
          }
        }
      })
      .subscribe();

    return () => {
      reportsSubscription.unsubscribe();
    };
  }, [session, userRole]); // Hanya session dan userRole sebagai dependency untuk menghindari reload berulang

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveReport();
            break;
          case 'n':
            e.preventDefault();
            resetForm(); // Reset form when navigating to create new report
            setCurrentView('create');
            break;
          case 'd':
            e.preventDefault();
            setCurrentView('dashboard');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [saveReport, resetForm]); // Dependencies are now correctly defined

  const handleSignOut = async () => {
    const loadingToastId = showLoading('Keluar...');
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      showError('Gagal keluar. Silakan coba lagi.');
    } else {
      showSuccess('Anda telah berhasil keluar.');
    }
    dismissToast(loadingToastId);
    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b border-emerald-200 dark:border-emerald-700">
        <div className="flex justify-between items-center h-14 sm:h-16 px-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors"
              title={isSidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
            >
              {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <img src="/Lagi_ikon.png" alt="Lapor Giat Icon" className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-lg sm:text-xl font-bold text-emerald-600">Lapor Giat</h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <GoogleAuth
              onAuthChange={(signedIn) => {
                setIsGoogleSignedIn(signedIn);
              }}
            />

            {/* User Info */}
            {userProfile && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <UserCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {userProfile.full_name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {userRole === 'principal' ? 'Kepala Sekolah' :
                      userRole === 'foundation' ? 'Yayasan' :
                        'Administrator'}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-600 hover:text-emerald-600 dark:text-gray-300 transition-colors"
              title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Vertical Sidebar */}
      <aside className={`fixed left-0 top-14 sm:top-16 bottom-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 lg:w-64`}>
        <nav className="h-full overflow-y-auto py-4">
          {/* User Info in Sidebar */}
          {userProfile && isSidebarOpen && (
            <div className="px-4 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {userProfile.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userProfile.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {userRole === 'principal' ? 'Kepala Sekolah' :
                      userRole === 'foundation' ? 'Yayasan' :
                        'Administrator'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* User Icon Only (Collapsed) */}
          {userProfile && !isSidebarOpen && (
            <div className="flex justify-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}

          <div className="space-y-1 px-2">
            {/* Dashboard */}
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentView === 'dashboard'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              title={!isSidebarOpen ? 'Dashboard' : ''}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
            </button>

            {/* Buat Laporan */}
            {(userRole === 'principal' || userRole === 'admin') && (
              <button
                onClick={() => {
                  resetForm();
                  setCurrentView('create');
                }}
                className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentView === 'create'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                title={!isSidebarOpen ? 'Buat Laporan' : ''}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">Buat Laporan</span>}
              </button>
            )}

            {/* Laporan */}
            <button
              onClick={() => setCurrentView('reports')}
              className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentView === 'reports'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              title={!isSidebarOpen ? 'Laporan' : ''}
            >
              <Save className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">Laporan</span>}
            </button>

            {/* RAB */}
            {(userRole === 'principal' || userRole === 'admin' || userRole === 'foundation') && (
              <button
                onClick={() => setCurrentView('rab-list')}
                className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentView === 'rab-list' || currentView === 'rab-form'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                title={!isSidebarOpen ? 'RAB' : ''}
              >
                <DollarSign className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">RAB</span>}
              </button>
            )}

            {/* Realisasi */}
            {(userRole === 'principal' || userRole === 'admin' || userRole === 'foundation') && (
              <button
                onClick={() => setCurrentView('realization-list')}
                className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentView === 'realization-list' || currentView === 'realization-form'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                title={!isSidebarOpen ? 'Realisasi' : ''}
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">Realisasi</span>}
              </button>
            )}

            {/* Supervisi Tahfidz */}
            {(userRole === 'principal' || userRole === 'admin') && (
              <>
                <button
                  onClick={() => navigate('/tahfidz-supervision')}
                  className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700`}
                  title={!isSidebarOpen ? 'Supervisi Tahfidz' : ''}
                >
                  <Award className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="text-sm font-medium">Supervisi Tahfidz</span>}
                </button>

                {/* Submenu Jadwal - Only show when sidebar is open */}
                {isSidebarOpen && (
                  <div className="ml-4 space-y-1">
                    <button
                      onClick={() => navigate('/teachers')}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>Daftar Guru</span>
                    </button>
                    <button
                      onClick={() => navigate('/tahfidz-supervision-schedule')}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Jadwal Per Tanggal</span>
                    </button>
                    <button
                      onClick={() => navigate('/tahfidz-annual-schedule')}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <CalendarDays className="w-4 h-4 flex-shrink-0" />
                      <span>Jadwal Tahunan</span>
                    </button>
                    <button
                      onClick={() => navigate('/tahfidz-foundation-reports')}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span>Laporan Yayasan</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Penilaian Yayasan */}
            {(userRole === 'foundation' || userRole === 'admin' || userRole === 'principal') && (
              <>
                <button
                  onClick={() => setCurrentView('foundation-evaluation')}
                  className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentView === 'foundation-evaluation'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  title={!isSidebarOpen ? 'Penilaian Yayasan' : ''}
                >
                  <Award className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="text-sm font-medium">Penilaian Yayasan</span>}
                </button>

                <button
                  onClick={() => navigate('/tahfidz-foundation-reports')}
                  className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700`}
                  title={!isSidebarOpen ? 'Laporan Supervisi Guru Tahfidz' : ''}
                >
                  <FileText className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="text-sm font-medium">Laporan Supervisi Guru Tahfidz</span>}
                </button>
              </>
            )}

            {/* Statistik */}
            <button
              onClick={() => setCurrentView('analytics')}
              className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentView === 'analytics'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              title={!isSidebarOpen ? 'Statistik' : ''}
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">Statistik</span>}
            </button>

            {/* Daftar Akun */}
            {userRole === 'admin' && (
              <button
                onClick={() => setCurrentView('users')}
                className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentView === 'users'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                title={!isSidebarOpen ? 'Daftar Akun' : ''}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">Daftar Akun</span>}
              </button>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="transition-all duration-300 pt-20 sm:pt-24 pb-8 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
          )}

          {currentView === 'dashboard' && (
            <DashboardPage
              reports={reports}
              getAveragePerformance={getAverageEvaluationScore} // Menggunakan fungsi baru
            />
          )}
          {currentView === 'create' && (userRole === 'principal' || userRole === 'admin') && ( // Allow 'principal' AND 'admin' to create
            <CreateReportPage
              currentReport={currentReport}
              setCurrentReport={setCurrentReport}
              saveReport={saveReport}
              submitReport={submitReport}
              resetForm={resetForm}
              isLoading={isLoading}
              // showSuccessMessage={showSuccessMessage} // Replaced by toast
              // setShowSuccessMessage={setShowSuccessMessage} // Replaced by toast
              getAveragePerformance={getAverageEvaluationScore} // Menggunakan fungsi baru
              allDetailedEvaluationItems={allDetailedEvaluationItems} // Meneruskan semua item penilaian
            />
          )}
          {currentView === 'reports' && (
            <ReportsPage
              reports={reports}
              isGoogleSignedIn={isGoogleSignedIn}
              isLoading={isLoading}
              exportToGoogleSheets={exportToGoogleSheets}
              setCurrentReport={setCurrentReport}
              setCurrentView={setCurrentView}
              getAveragePerformance={getAverageEvaluationScore} // Menggunakan fungsi baru
              deleteReport={deleteReport} // Pass deleteReport function
              userRole={userRole} // Pass userRole prop
              refreshReports={forceRefreshReports} // Pass refresh function
              onViewReport={handleViewReport} // Pass the new view report handler
            />
          )}
          {currentView === 'analytics' && (
            <AnalyticsPage
              reports={reports}
              allDetailedEvaluationItems={allDetailedEvaluationItems} // Meneruskan semua item penilaian
              getAverageEvaluationScore={getAverageEvaluationScore} // Menggunakan fungsi baru
            />
          )}
          {currentView === 'foundation-evaluation' && (userRole === 'foundation' || userRole === 'admin') && ( // Visible for 'foundation' AND 'admin'
            <FoundationEvaluationPage
              reports={reports}
              session={session}
              isLoading={isLoading}
              getAveragePerformance={getAverageEvaluationScore} // Menggunakan fungsi baru
              onReportUpdated={handleReportUpdated}
              allDetailedEvaluationItems={allDetailedEvaluationItems} // Meneruskan semua item penilaian
            />
          )}
          {currentView === 'users' && userRole === 'admin' && (
            <UsersPage />
          )}
          {currentView === 'rab-list' && (
            <>
              {console.log(`[IslamicPrincipalReportApp] Rendering RABListPage with userRole: ${userRole}`)}
              <RABListPage
                onEditRAB={handleEditRAB}
                onCreateNewRAB={handleCreateNewRAB}
                userRole={userRole}
              />
            </>
          )}
          {currentView === 'rab-form' && (
            <RABPage
              initialRABId={currentRABId}
              onRABSaved={handleRABSaved}
              userRole={userRole}
            />
          )}
          {currentView === 'realization-list' && (
            <RABRealizationListPage
              onEditRealization={handleEditRealization}
              onCreateNewRealization={handleCreateNewRealization}
              userRole={userRole}
            />
          )}
          {currentView === 'realization-form' && (
            <RABRealizationPage
              initialRealizationId={currentRealizationId}
              rabId={selectedRABForRealization}
              onRealizationSaved={handleRealizationSaved}
              userRole={userRole}
            />
          )}
          {/* ViewReportPage is now handled by App.tsx router directly */}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p className="mb-2">بارك الله فيكم - Semoga Allah memberkahi usaha kita</p>
            <p className="text-sm">© 2025 Lapor Giat - Dikembangkan dengan penuh amanah</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IslamicPrincipalReportApp;