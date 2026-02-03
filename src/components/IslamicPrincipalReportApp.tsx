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
import RABPage from '../pages/RABPage';
import RABListPage from '../pages/RABListPage';
import RABRealizationPage from '../pages/RABRealizationPage';
import RABRealizationListPage from '../pages/RABRealizationListPage';
import UsersPage from '../pages/UsersPage';
import ViewReportPage from '../pages/ViewReportPage';
import TahfidzSupervisionListPage from '../pages/TahfidzSupervisionListPage';
import TahfidzSupervisionFormPage from '../pages/TahfidzSupervisionFormPage';
import TahfidzSupervisionViewPage from '../pages/TahfidzSupervisionViewPage';
import TahfidzSupervisionSchedulePage from '../pages/TahfidzSupervisionSchedulePage';
import TahfidzAnnualSchedulePage from '../pages/TahfidzAnnualSchedulePage';
import FoundationTahfidzReportPage from '../pages/FoundationTahfidzReportPage';
import TeacherManagementPage from '../pages/TeacherManagementPage';
import TeachersUploadPage from '../pages/TeachersUploadPage';
import MemoListPage from '../pages/MemoListPage';
import MemoFormPage from '../pages/MemoFormPage';

// Import types and constants
import { ReportData, Activity, Achievement, DetailedEvaluationItem, allDetailedEvaluationItems, activityCategories } from '../types/report';
import { defaultRABData, RABData as RABDataType } from '../types/rab'; // Import RABData as RABDataType to avoid conflict

interface IslamicPrincipalReportAppProps {
  session: Session;
}

type AppView =
  | 'dashboard'
  | 'create'
  | 'reports'
  | 'analytics'
  | 'foundation-evaluation'
  | 'rab-list'
  | 'rab-form'
  | 'realization-list'
  | 'realization-form'
  | 'users'
  | 'view-report'
  | 'tahfidz-supervision'
  | 'tahfidz-supervision-form'
  | 'tahfidz-supervision-view'
  | 'tahfidz-supervision-schedule'
  | 'tahfidz-annual-schedule'
  | 'tahfidz-foundation-reports'
  | 'teachers'
  | 'teachers-upload'
  | 'memo-list'
  | 'memo-form';

const IslamicPrincipalReportApp: React.FC<IslamicPrincipalReportAppProps> = ({ session }) => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [viewParams, setViewParams] = useState<Record<string, any>>({});
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
  const [currentMemoId, setCurrentMemoId] = useState<string | undefined>(undefined);
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
      // First save as draft to ensure we have a valid record
      const draftReport = await saveReportToSupabase(currentReport, session.user.id);
      
      // Then submit the saved report
      const submittedReport = {
        ...draftReport, // Use the saved report data
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
    setViewParams({ reportId });
    setCurrentView('view-report');
  }, []);

  // --- Tahfidz Supervision Specific Callbacks ---
  const handleViewTahfidzSupervision = useCallback((id: string) => {
    setViewParams({ id });
    setCurrentView('tahfidz-supervision-view');
  }, []);

  const handleEditTahfidzSupervision = useCallback((id: string) => {
    setViewParams({ id });
    setCurrentView('tahfidz-supervision-form');
  }, []);

  const handleCreateTahfidzSupervision = useCallback(() => {
    setViewParams({});
    setCurrentView('tahfidz-supervision-form');
  }, []);

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
      {/* Top Header - Glassmorphism UI */}
      <header className={`fixed top-0 right-0 left-0 z-30 transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 ${isSidebarOpen ? 'lg:left-64' : 'lg:left-64'
        }`}>
        <div className="flex justify-between items-center h-16 sm:h-20 px-4 sm:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isSidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden flex items-center space-x-2">
              <img src="/Lagi_ikon.png" alt="Lapor Giat Icon" className="w-8 h-8" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Lapor Giat</h1>
            </div>

            {/* Breadcrumb or Title for desktop */}
            <div className="hidden lg:block">
              <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">
                {currentView.replace(/-/g, ' ')}
              </h2>
              <p className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {(() => {
                  switch (currentView) {
                    case 'dashboard': return 'Beranda Utama';
                    case 'create': return 'Buat Laporan Baru';
                    case 'reports': return 'Daftar Laporan';
                    case 'analytics': return 'Statistik & Analitik';
                    case 'foundation-evaluation': return 'Penilaian Yayasan';
                    case 'rab-list': return 'Daftar RAB';
                    case 'rab-form': return 'Formulir RAB';
                    case 'realization-list': return 'Daftar Realisasi';
                    case 'realization-form': return 'Formulir Realisasi';
                    case 'users': return 'Manajemen Akun';
                    case 'view-report': return 'Detail Laporan';
                    case 'memo-list': return 'Daftar Memo Internal';
                    case 'memo-form': return userRole === 'principal' ? 'Buat/Edit Memo' : 'Lihat Memo';
                    case 'tahfidz-supervision': return 'Daftar Supervisi';
                    case 'tahfidz-supervision-form': return 'Input Supervisi';
                    case 'tahfidz-supervision-view': return 'Lihat Supervisi';
                    case 'tahfidz-supervision-schedule': return 'Jadwal Supervisi';
                    case 'tahfidz-annual-schedule': return 'Program Tahunan';
                    case 'tahfidz-foundation-reports': return 'Laporan Tahfidz';
                    case 'teachers': return 'Data Guru';
                    case 'teachers-upload': return 'Unggah Data Guru';
                    default: return (currentView as string).split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  }
                })()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            <GoogleAuth
              onAuthChange={(signedIn) => {
                setIsGoogleSignedIn(signedIn);
              }}
            />

            <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-400 rounded-xl transition-all hover:scale-110"
              title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleSignOut}
              className="group flex items-center space-x-2 px-4 py-2.5 text-sm font-bold bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all duration-300 border border-red-100 hover:border-red-600 shadow-sm"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
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
      <aside className={`fixed top-0 bottom-0 left-0 z-40 bg-[#1e293b] dark:bg-slate-950 text-white w-64 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header - Static Name */}
          <div className="px-6 py-8 border-b border-slate-700/50">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Lapor Giat</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">LAPORAN KEPALA SEKOLAH</p>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            {/* User Profile Mini (Always visible in static sidebar) */}
            {userProfile && (
              <div className="mb-8 px-2 py-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{userProfile.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate opacity-80">{userProfile.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard */}
            <button
              onClick={() => { setCurrentView('dashboard'); setViewParams({}); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <BarChart3 className={`w-5 h-5 flex-shrink-0 ${currentView === 'dashboard' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
              <span className="text-sm font-semibold">Dashboard</span>
            </button>

            {/* Buat Laporan */}
            {(userRole === 'principal' || userRole === 'admin') && (
              <button
                onClick={() => { resetForm(); setCurrentView('create'); setViewParams({}); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'create'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <FileText className={`w-5 h-5 flex-shrink-0 ${currentView === 'create' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                <span className="text-sm font-semibold">Buat Laporan</span>
              </button>
            )}

            {/* Laporan */}
            <button
              onClick={() => { setCurrentView('reports'); setViewParams({}); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'reports' || currentView === 'view-report'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Save className={`w-5 h-5 flex-shrink-0 ${currentView === 'reports' || currentView === 'view-report' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
              <span className="text-sm font-semibold">Semua Laporan</span>
            </button>

            <div className="pt-4 pb-2 px-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Manajemen Keuangan</p>
            </div>

            {/* RAB */}
            {(userRole === 'principal' || userRole === 'admin' || userRole === 'foundation') && (
              <button
                onClick={() => { setCurrentView('rab-list'); setViewParams({}); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'rab-list' || currentView === 'rab-form'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <DollarSign className={`w-5 h-5 flex-shrink-0 ${currentView === 'rab-list' || currentView === 'rab-form' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                <span className="text-sm font-semibold">RAB</span>
              </button>
            )}

            {/* Realisasi */}
            {(userRole === 'principal' || userRole === 'admin' || userRole === 'foundation') && (
              <button
                onClick={() => { setCurrentView('realization-list'); setViewParams({}); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'realization-list' || currentView === 'realization-form'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${currentView === 'realization-list' || currentView === 'realization-form' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                <span className="text-sm font-semibold">Realisasi</span>
              </button>
            )}

            {/* Memo Internal */}
            {(userRole === 'principal' || userRole === 'admin' || userRole === 'foundation') && (
              <button
                onClick={() => { setCurrentView('memo-list'); setViewParams({}); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'memo-list' || currentView === 'memo-form'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <FileText className={`w-5 h-5 flex-shrink-0 ${currentView === 'memo-list' || currentView === 'memo-form' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                <span className="text-sm font-semibold">Memo Internal</span>
              </button>
            )}

            <div className="pt-4 pb-2 px-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Akademik & Guru</p>
            </div>

            {/* Supervisi Tahfidz */}
            {(userRole === 'principal' || userRole === 'admin') && (
              <div className="space-y-1">
                <button
                  onClick={() => { setCurrentView('tahfidz-supervision'); setViewParams({}); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView.startsWith('tahfidz-supervision')
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Award className={`w-5 h-5 flex-shrink-0 ${currentView.startsWith('tahfidz-supervision') ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                  <span className="text-sm font-semibold">Supervisi Tahfidz</span>
                </button>

                <div className="ml-4 pl-4 border-l border-slate-700/50 space-y-1">
                  <button
                    onClick={() => { setCurrentView('teachers'); setViewParams({}); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${currentView === 'teachers' || currentView === 'teachers-upload'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                      }`}
                  >
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Daftar Guru</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('tahfidz-supervision-schedule'); setViewParams({}); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${currentView === 'tahfidz-supervision-schedule'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                      }`}
                  >
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Jadwal Harian</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('tahfidz-annual-schedule'); setViewParams({}); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${currentView === 'tahfidz-annual-schedule'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                      }`}
                  >
                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                    <span>Jadwal Tahunan</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 pb-2 px-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Yayasan & Sistem</p>
            </div>

            {/* Penilaian Yayasan */}
            {(userRole === 'foundation' || userRole === 'admin' || userRole === 'principal') && (
              <>
                <button
                  onClick={() => { setCurrentView('foundation-evaluation'); setViewParams({}); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'foundation-evaluation'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Award className={`w-5 h-5 flex-shrink-0 ${currentView === 'foundation-evaluation' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                  <span className="text-sm font-semibold">Penilaian Yayasan</span>
                </button>

                <button
                  onClick={() => { setCurrentView('tahfidz-foundation-reports'); setViewParams({}); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'tahfidz-foundation-reports'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <FileText className={`w-5 h-5 flex-shrink-0 ${currentView === 'tahfidz-foundation-reports' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                  <span className="text-sm font-semibold">Laporan Tahfidz Yayasan</span>
                </button>
              </>
            )}

            {/* Statistik */}
            <button
              onClick={() => { setCurrentView('analytics'); setViewParams({}); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'analytics'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <TrendingUp className={`w-5 h-5 flex-shrink-0 ${currentView === 'analytics' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
              <span className="text-sm font-semibold">Statistik</span>
            </button>

            {/* Daftar Akun */}
            {userRole === 'admin' && (
              <button
                onClick={() => { setCurrentView('users'); setViewParams({}); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentView === 'users'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Users className={`w-5 h-5 flex-shrink-0 ${currentView === 'users' ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                <span className="text-sm font-semibold">Daftar Akun</span>
              </button>
            )}
          </nav>

          <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
            <p className="text-[10px] text-slate-500 text-center font-medium">© 2025 Lapor Giat <br /> Versi Statis Premium</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="transition-all duration-300 pt-24 sm:pt-32 pb-12 lg:ml-64 bg-[#f8fafc] dark:bg-slate-900 min-h-screen relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100]">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memproses data...</p>
              </div>
            </div>
          )}

          {currentView === 'dashboard' && (
            <DashboardPage
              reports={reports}
              getAveragePerformance={getAverageEvaluationScore}
            />
          )}

          {currentView === 'create' && (userRole === 'principal' || userRole === 'admin') && (
            <CreateReportPage
              currentReport={currentReport}
              setCurrentReport={setCurrentReport}
              saveReport={saveReport}
              submitReport={submitReport}
              resetForm={resetForm}
              isLoading={isLoading}
              getAveragePerformance={getAverageEvaluationScore}
              allDetailedEvaluationItems={allDetailedEvaluationItems}
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
              getAveragePerformance={getAverageEvaluationScore}
              deleteReport={deleteReport}
              userRole={userRole}
              refreshReports={forceRefreshReports}
              onViewReport={handleViewReport}
            />
          )}

          {currentView === 'view-report' && viewParams.reportId && (
            <ViewReportPage
              reportId={viewParams.reportId}
              isInternal={true}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsPage
              reports={reports}
              allDetailedEvaluationItems={allDetailedEvaluationItems}
              getAverageEvaluationScore={getAverageEvaluationScore}
            />
          )}

          {currentView === 'foundation-evaluation' && (userRole === 'foundation' || userRole === 'admin' || userRole === 'principal') && (
            <FoundationEvaluationPage
              reports={reports}
              session={session}
              isLoading={isLoading}
              getAveragePerformance={getAverageEvaluationScore}
              onReportUpdated={handleReportUpdated}
              allDetailedEvaluationItems={allDetailedEvaluationItems}
            />
          )}

          {currentView === 'users' && userRole === 'admin' && (
            <UsersPage />
          )}

          {currentView === 'rab-list' && (
            <RABListPage
              onEditRAB={handleEditRAB}
              onCreateNewRAB={handleCreateNewRAB}
              userRole={userRole}
            />
          )}

          {currentView === 'rab-form' && (
            <RABPage
              initialRABId={currentRABId}
              onRABSaved={handleRABSaved}
              userRole={userRole}
              isInternal={true}
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
              isInternal={true}
            />
          )}

          {/* Tahfidz Supervision Views */}
          {currentView === 'tahfidz-supervision' && (
            <TahfidzSupervisionListPage
              onView={handleViewTahfidzSupervision}
              onEdit={handleEditTahfidzSupervision}
              onCreate={handleCreateTahfidzSupervision}
            />
          )}

          {currentView === 'tahfidz-supervision-form' && (
            <TahfidzSupervisionFormPage
              id={viewParams.id}
              onSaved={() => setCurrentView('tahfidz-supervision')}
            />
          )}

          {currentView === 'tahfidz-supervision-view' && viewParams.id && (
            <TahfidzSupervisionViewPage
              id={viewParams.id}
            />
          )}

          {currentView === 'tahfidz-supervision-schedule' && (
            <TahfidzSupervisionSchedulePage
              onBack={() => setCurrentView('dashboard')}
              onNavigateToAnnual={() => setCurrentView('tahfidz-annual-schedule')}
            />
          )}

          {currentView === 'tahfidz-annual-schedule' && (
            <TahfidzAnnualSchedulePage
              onBack={() => setCurrentView('dashboard')}
              onNavigateToDaily={() => setCurrentView('tahfidz-supervision-schedule')}
            />
          )}

          {currentView === 'tahfidz-foundation-reports' && (
            <FoundationTahfidzReportPage />
          )}

          {currentView === 'teachers' && (
            <TeacherManagementPage
              onUpload={() => setCurrentView('teachers-upload')}
            />
          )}

          {currentView === 'teachers-upload' && (
            <TeachersUploadPage
              onSuccess={() => setCurrentView('teachers')}
              onCancel={() => setCurrentView('teachers')}
            />
          )}

          {currentView === 'memo-list' && (
            <MemoListPage
              userRole={userRole}
              onCreateNewMemo={() => {
                setCurrentMemoId(undefined);
                setCurrentView('memo-form');
              }}
              onEditMemo={(id) => {
                setCurrentMemoId(id);
                setCurrentView('memo-form');
              }}
            />
          )}

          {currentView === 'memo-form' && (
            <MemoFormPage
              memoId={currentMemoId}
              userRole={userRole}
              onSaved={() => {
                setCurrentView('memo-list');
              }}
              onCancel={() => {
                setCurrentView('memo-list');
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
            <div className="text-gray-600 dark:text-gray-400">
              <p className="font-bold text-emerald-600 mb-1">بارك الله فيكم</p>
              <p className="text-sm">Semoga Allah memberkahi usaha dan amanah kita bersama.</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <p>© 2025 Lapor Giat - Sistem Pelaporan Pendidikan Islam</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IslamicPrincipalReportApp;