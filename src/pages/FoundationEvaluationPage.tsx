import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Star, FileText, User, CalendarDays, TrendingUp, Search } from 'lucide-react';
import { ReportData, DetailedEvaluationItem, reportPeriodOptions, ReportPeriodKey } from '../types/report';
import OptimizedSelect from '../components/OptimizedSelect';
import OptimizedInput from '../components/OptimizedInput'; // Import OptimizedInput
import { saveReportToSupabase } from '../services/supabaseService';
import { Session } from '@supabase/supabase-js';
import Tabs from '../components/Tabs'; // Import Tabs component
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast'; // Import toast utilities

interface FoundationEvaluationPageProps {
  reports: ReportData[];
  session: Session;
  isLoading: boolean;
  getAveragePerformance: (evaluation: { [itemId: string]: number }) => number;
  onReportUpdated: () => void;
  allDetailedEvaluationItems: DetailedEvaluationItem[];
}

const FoundationEvaluationPage: React.FC<FoundationEvaluationPageProps> = ({
  reports,
  session,
  isLoading,
  getAveragePerformance,
  onReportUpdated,
  allDetailedEvaluationItems,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [foundationEvaluation, setFoundationEvaluation] = useState<{ [itemId: string]: number }>({});
  const [foundationComment, setFoundationComment] = useState<string>(''); // State for foundation comment
  // const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Replaced by toast
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'approved'>('submitted'); // State for status filter

  // Filter reports to only show 'submitted' ones initially, then apply search/status filters
  const filteredReports = useMemo(() => {
    let currentReports = reports.filter(report => report.status === 'submitted' || report.status === 'approved');

    if (filterStatus !== 'all') {
      currentReports = currentReports.filter(report => report.status === filterStatus);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentReports = currentReports.filter(report =>
        report.principalName.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.schoolName.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.date.includes(lowerCaseSearchTerm) ||
        reportPeriodOptions[report.period as ReportPeriodKey]?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return currentReports;
  }, [reports, searchTerm, filterStatus]);

  useEffect(() => {
    if (selectedReport) {
      const initialEvaluation: { [itemId: string]: number } = {};
      allDetailedEvaluationItems.forEach(item => {
        initialEvaluation[item.id] = selectedReport.foundationEvaluation?.[item.id] ?? 0;
      });
      setFoundationEvaluation(initialEvaluation);
      setFoundationComment(selectedReport.foundationComment || ''); // Set initial comment
    } else {
      setFoundationEvaluation({});
      setFoundationComment('');
    }
  }, [selectedReport, allDetailedEvaluationItems]);

  const handleUpdateFoundationEvaluation = useCallback((itemId: string, value: number) => {
    setFoundationEvaluation(prev => ({
      ...prev,
      [itemId]: value
    }));
  }, []);

  const handleSaveEvaluation = useCallback(async () => {
    if (!selectedReport || !session?.user?.id) {
      showError('Pilih laporan dan pastikan Anda login untuk menyimpan penilaian.');
      return;
    }

    const unscoredItems = allDetailedEvaluationItems.filter(item => foundationEvaluation[item.id] === undefined || foundationEvaluation[item.id] === null);
    if (unscoredItems.length > 0) {
      showError(`Harap lengkapi semua item penilaian yayasan. Ada ${unscoredItems.length} item yang belum dinilai.`);
      return;
    }

    const loadingToastId = showLoading('Menyimpan penilaian...');
    setIsSaving(true);
    try {
      const updatedReport = {
        ...selectedReport,
        foundationEvaluation: foundationEvaluation,
        foundationComment: foundationComment, // Save the comment
        status: 'approved' as 'approved',
      };
      await saveReportToSupabase(updatedReport, session.user.id);
      showSuccess('Penilaian yayasan berhasil disimpan dan laporan disetujui!');
      setSelectedReport(null);
      onReportUpdated();
    } catch (error) {
      console.error('Gagal menyimpan penilaian yayasan:', error);
      showError('Gagal menyimpan penilaian. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSaving(false);
    }
  }, [selectedReport, foundationEvaluation, foundationComment, session, onReportUpdated, allDetailedEvaluationItems]);

  const handleRejectReport = useCallback(async () => {
    if (!selectedReport || !session?.user?.id) {
      showError('Pilih laporan dan pastikan Anda login untuk menolak laporan.');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menolak laporan ini? Laporan akan dikembalikan ke status draft.')) {
      return;
    }

    const loadingToastId = showLoading('Menolak laporan...');
    setIsSaving(true);
    try {
      const updatedReport = {
        ...selectedReport,
        status: 'draft' as 'draft',
        foundationEvaluation: {}, // Clear evaluation on rejection
        foundationComment: foundationComment, // Save the comment even on rejection
      };
      await saveReportToSupabase(updatedReport, session.user.id);
      showSuccess('Laporan berhasil ditolak dan dikembalikan ke status draft.');
      setSelectedReport(null);
      onReportUpdated();
    } catch (error) {
      console.error('Gagal menolak laporan:', error);
      showError('Gagal menolak laporan. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSaving(false);
    }
  }, [selectedReport, foundationComment, session, onReportUpdated]);

  const averageFoundationPerformance = useMemo(() => {
    return getAveragePerformance(foundationEvaluation);
  }, [foundationEvaluation, getAveragePerformance]);

  // Group evaluation items by Bidang and Kategori for display in Tabs
  const groupedEvaluationItems = useMemo(() => {
    const grouped: { [bidang: string]: { [kategori: string]: DetailedEvaluationItem[] } } = {};
    allDetailedEvaluationItems.forEach(item => {
      if (!grouped[item.bidang]) {
        grouped[item.bidang] = {};
      }
      if (!grouped[item.bidang][item.kategori]) {
        grouped[item.bidang][item.kategori] = [];
      }
      grouped[item.bidang][item.kategori].push(item);
    });
    return grouped;
  }, [allDetailedEvaluationItems]);

  // Prepare tabs data for the Tabs component
  const evaluationTabs = useMemo(() => {
    return Object.entries(groupedEvaluationItems).map(([bidang, kategoriGroup]) => ({
      id: bidang,
      label: bidang,
      content: (
        <div className="space-y-6">
          {Object.entries(kategoriGroup).map(([kategori, items]) => (
            <div key={kategori} className="mb-6 ml-4 border-l-4 border-teal-300 pl-4">
              <h6 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{kategori}</h6>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">{item.item} <span className="text-red-500">*</span></p>
                    <OptimizedSelect
                      value={foundationEvaluation[item.id]?.toString() || ''}
                      onChange={(value) => handleUpdateFoundationEvaluation(item.id, parseFloat(value))}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-white ${
                        (foundationEvaluation[item.id] === undefined || foundationEvaluation[item.id] === null) ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-500'
                      }`}
                      title={`Pilih bobot untuk: ${item.item}`}
                      required
                      readOnly={isSaving}
                    >
                      <option value="">Pilih Bobot</option>
                      {item.bobotOptions.map(option => (
                        <option key={option.score} value={option.score}>
                          {option.score} - {option.description}
                        </option>
                      ))}
                    </OptimizedSelect>
                    {(foundationEvaluation[item.id] === undefined || foundationEvaluation[item.id] === null) && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        Item penilaian ini harus diisi
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    }));
  }, [groupedEvaluationItems, foundationEvaluation, handleUpdateFoundationEvaluation, isSaving]);

  // Calculate average scores per Bidang for Principal's Self-Evaluation
  const principalAverageScoresPerBidang = useMemo(() => {
    if (!selectedReport) return {};
    const scores: { [bidang: string]: number[] } = {};
    Object.entries(selectedReport.principalEvaluation).forEach(([itemId, score]) => {
      const item = allDetailedEvaluationItems.find(i => i.id === itemId);
      if (item) {
        if (!scores[item.bidang]) {
          scores[item.bidang] = [];
        }
        scores[item.bidang].push(score);
      }
    });

    const averages: { [bidang: string]: number } = {};
    Object.entries(scores).forEach(([bidang, scoreList]) => {
      if (scoreList.length > 0) {
        averages[bidang] = scoreList.reduce((sum, s) => sum + s, 0) / scoreList.length;
      } else {
        averages[bidang] = 0;
      }
    });
    return averages;
  }, [selectedReport, allDetailedEvaluationItems]);


  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Penilaian Laporan Yayasan</h2>
        <p className="text-gray-600 dark:text-gray-300">Berikan penilaian Anda untuk laporan yang telah dikirim oleh kepala sekolah.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Submitted Reports */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full max-h-[80vh] overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Laporan Terkirim ({filteredReports.length})</h3>
          
          {/* Search and Filter */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <OptimizedInput
                type="text"
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="Cari laporan (nama KS, sekolah, tanggal)"
                title="Cari laporan"
              />
            </div>
            <OptimizedSelect
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'all' | 'submitted' | 'approved')}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              title="Filter berdasarkan status"
            >
              <option value="all">Semua Status</option>
              <option value="submitted">Terkirim</option>
              <option value="approved">Disetujui</option>
            </OptimizedSelect>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-500">Memuat laporan...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Tidak ada laporan terkirim yang menunggu penilaian.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    selectedReport?.id === report.id
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-500 shadow-md'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="font-semibold text-gray-800 dark:text-white">{report.principalName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{report.schoolName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <CalendarDays className="inline-block w-3 h-3 mr-1" /> {report.date}
                    <span className="ml-3">
                      <TrendingUp className="inline-block w-3 h-3 mr-1" /> Kinerja KS: {(getAveragePerformance(report.principalEvaluation) * 10).toFixed(0)}%
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {selectedReport ? (
            <>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Penilaian untuk Laporan: {selectedReport.principalName} ({selectedReport.schoolName})
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tanggal Laporan: {selectedReport.date} | Periode: {reportPeriodOptions[selectedReport.period as ReportPeriodKey] || selectedReport.period}
              </p>

              {/* Principal's Self-Evaluation Summary by Bidang */}
              <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" /> Penilaian Diri Kepala Sekolah (Ringkasan)
                </h4>
                <div className="space-y-3">
                  {Object.entries(principalAverageScoresPerBidang).map(([bidang, avgScore]) => (
                    <div key={bidang} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{bidang}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {(avgScore * 10).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-700 flex justify-between items-center font-bold text-emerald-800 dark:text-emerald-200">
                    <span>Rata-rata Kinerja Diri Keseluruhan</span>
                    <span>{(getAveragePerformance(selectedReport.principalEvaluation) * 10).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Foundation's Evaluation */}
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-amber-500" /> Penilaian Yayasan
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Berikan penilaian Anda pada aspek-aspek berikut (skala 1-10)</p>

              {/* Render Tabs here for Foundation Evaluation */}
              <Tabs tabs={evaluationTabs} defaultActiveTabId={evaluationTabs.length > 0 ? evaluationTabs[0].id : ''} />

              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  Rata-rata Kinerja (Penilaian Yayasan): {(averageFoundationPerformance * 10).toFixed(0)}%
                </p>
              </div>

              {/* Foundation Comment */}
              <div className="mt-6">
                <label htmlFor="foundationComment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catatan (Opsional)
                </label>
                <OptimizedInput
                  type="textarea"
                  value={foundationComment}
                  onChange={setFoundationComment}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Berikan catatan atau umpan balik Anda mengenai laporan ini..."
                  readOnly={isSaving}
                />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  onClick={handleRejectReport}
                  className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
                  disabled={isSaving}
                >
                  <XCircle className="w-5 h-5" />
                  <span>{isSaving ? 'Menolak...' : 'Tolak Laporan'}</span>
                </button>
                <button
                  onClick={handleSaveEvaluation}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  disabled={isSaving}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{isSaving ? 'Menyetujui...' : 'Setujui & Simpan Penilaian'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Pilih laporan dari daftar di samping untuk memulai penilaian.</p>
              <p className="text-sm mt-2">Hanya laporan dengan status "Terkirim" atau "Disetujui" yang dapat dinilai.</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {/* {showSuccessMessage && ( // Replaced by toast
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <CheckCircle className="w-5 h-5" />
          <span>Aksi berhasil!</span>
        </div>
      )} */}
    </div>
  );
};

export default FoundationEvaluationPage;