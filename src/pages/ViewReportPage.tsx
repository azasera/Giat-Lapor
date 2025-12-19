import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ReportData, allDetailedEvaluationItems } from '../types/report';
import { fetchSingleReport } from '../services/supabaseService';
import ReportPdfContent from '../components/ReportPdfContent'; // Reusing the PDF content component for structured display
import { showLoading, dismissToast, showError } from '../utils/toast';

interface ViewReportPageProps {
  reportId?: string;
  isInternal?: boolean;
}

const ViewReportPage: React.FC<ViewReportPageProps> = ({ reportId: propReportId, isInternal = false }) => {
  console.log('--- ViewReportPage component is rendering ---');
  const { reportId: paramReportId } = useParams<{ reportId: string }>();
  const reportId = propReportId || paramReportId;
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Log reportId immediately when component renders
  console.log('[ViewReportPage] Component rendered. reportId:', reportId);

  const getAverageEvaluationScore = useCallback((evaluation: { [itemId: string]: number }) => {
    const scores = Object.values(evaluation);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, []);

  useEffect(() => {
    const loadReport = async () => {
      console.log('[ViewReportPage] useEffect triggered. Attempting to load report with ID:', reportId);

      if (!reportId) {
        if (!isInternal) {
          showError('ID Laporan tidak ditemukan.');
          navigate('/reports');
        }
        return;
      }

      const loadingToastId = showLoading('Memuat laporan...');
      setIsLoading(true);
      try {
        const fetchedReport = await fetchSingleReport(reportId);
        if (fetchedReport) {
          setReport(fetchedReport);
          console.log('[ViewReportPage] Report loaded successfully:', fetchedReport.id);
        } else {
          if (!isInternal) {
            showError('Laporan tidak ditemukan atau Anda tidak memiliki akses.');
            navigate('/reports');
          }
        }
      } catch (error) {
        console.error('[ViewReportPage] Gagal memuat laporan:', error);
        showError('Terjadi kesalahan saat memuat laporan.');
        if (!isInternal) navigate('/reports');
      } finally {
        dismissToast(loadingToastId);
        setIsLoading(false);
      }
    };

    loadReport();
  }, [reportId, navigate, getAverageEvaluationScore, isInternal]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
        <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Memuat laporan...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <h2 className="text-xl font-bold mb-4">Laporan tidak ditemukan.</h2>
        {!isInternal && (
          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Kembali ke Daftar Laporan
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        {!isInternal && (
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
        )}
        <h1 className={`${isInternal ? 'text-xl sm:text-2xl text-left' : 'text-2xl text-center'} font-bold text-emerald-700 dark:text-emerald-400 flex-grow`}>
          Detail Laporan Kegiatan
        </h1>
        {isInternal && <div className="flex-grow-0"></div>}
        {!isInternal && <div className="w-24"></div>}
      </div>

      <div className="report-content-container bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow-inner">
        <ReportPdfContent
          report={report}
          allDetailedEvaluationItems={allDetailedEvaluationItems}
          getAverageEvaluationScore={getAverageEvaluationScore}
        />
      </div>
    </div>
  );
};

export default ViewReportPage;