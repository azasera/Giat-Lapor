import React, { useState } from 'react';
import { Download, Edit, Trash2, Eye, FileText, FileDown, RefreshCw } from 'lucide-react'; // Import icons
import { ReportData, reportPeriodOptions, ReportPeriodKey, allDetailedEvaluationItems } from '../types/report';
import ReportTextContent from '../components/ReportTextContent';
import FoundationEvaluationDetailModal from '../components/FoundationEvaluationDetailModal'; // Import the new modal component
import { generateReportPdf } from '../services/pdfService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface ReportsPageProps {
  reports: ReportData[];
  isGoogleSignedIn: boolean;
  isLoading: boolean;
  exportToGoogleSheets: () => Promise<void>;
  setCurrentReport: (report: ReportData) => void;
  setCurrentView: (view: 'dashboard' | 'create' | 'reports' | 'analytics' | 'foundation-evaluation') => void; // Updated setCurrentView type
  getAveragePerformance: (evaluation: { [itemId: string]: number }) => number;
  deleteReport: (reportId: string) => Promise<void>;
  userRole: 'principal' | 'foundation' | 'admin';
  refreshReports?: () => Promise<void>;
  onViewReport: (reportId: string) => void; // New prop for viewing report
}

const ReportsPage: React.FC<ReportsPageProps> = ({
  reports,
  isGoogleSignedIn,
  isLoading,
  exportToGoogleSheets,
  setCurrentReport,
  setCurrentView,
  getAveragePerformance,
  deleteReport,
  userRole,
  refreshReports,
  onViewReport, // Destructure new prop
}) => {
  const showActionsColumn = userRole !== 'foundation';
  const [showEvaluationModal, setShowEvaluationModal] = useState(false); // State for modal visibility
  const [selectedReportForEvaluation, setSelectedReportForEvaluation] = useState<ReportData | null>(null); // State for report in modal
  const [showTextContent, setShowTextContent] = useState(false); // State for text content visibility
  const [selectedReportForText, setSelectedReportForText] = useState<ReportData | null>(null); // State for report text content
  const navigate = useNavigate(); // Initialize useNavigate

  const openEvaluationModal = (report: ReportData) => {
    setSelectedReportForEvaluation(report);
    setShowEvaluationModal(true);
  };

  const closeEvaluationModal = () => {
    setShowEvaluationModal(false);
    setSelectedReportForEvaluation(null);
  };

  const openTextContent = (report: ReportData) => {
    setSelectedReportForText(report);
    setShowTextContent(true);
  };

  const closeTextContent = () => {
    setShowTextContent(false);
    setSelectedReportForText(null);
  };

  const handleDownloadPdf = (report: ReportData) => {
    try {
      const filename = `Laporan_${report.principalName.replace(/[^a-zA-Z0-9]/g, '_')}_${report.date}.pdf`;
      generateReportPdf({
        report,
        allDetailedEvaluationItems,
        getAverageEvaluationScore: getAveragePerformance
      }, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Daftar Laporan</h2>
          <div className="flex space-x-2">
            {refreshReports && (userRole === 'admin' || userRole === 'foundation') && (
              <button
                onClick={refreshReports}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                title="Refresh data untuk sinkronisasi dengan semua user"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            )}
            <button
              onClick={exportToGoogleSheets}
              disabled={!isGoogleSignedIn || isLoading}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isGoogleSignedIn
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {isLoading ? 'Exporting...' :
                 isGoogleSignedIn ? 'Export ke Sheets' : 'Login Google dulu'}
              </span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Kepala Sekolah</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Sekolah</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tanggal</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Periode</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Kinerja KS (Diri)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Penilaian Yayasan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200 text-sm">{report.id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{report.principalName}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{report.schoolName}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{report.date}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {reportPeriodOptions[report.period as ReportPeriodKey] || report.period}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === 'submitted' ? 'bg-green-100 text-green-800' : 
                      report.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {report.status === 'submitted' ? 'Terkirim' : 
                       report.status === 'approved' ? 'Disetujui' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {(getAveragePerformance(report.principalEvaluation) * 10).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4">
                    {report.foundationEvaluation && Object.keys(report.foundationEvaluation).length > 0
                      ? (
                        <button
                          onClick={() => openEvaluationModal(report)}
                          className="flex items-center space-x-1 text-amber-600 hover:text-amber-800 text-sm p-1 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Lihat Penilaian Yayasan"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{(getAveragePerformance(report.foundationEvaluation) * 10).toFixed(0)}%</span>
                        </button>
                      )
                      : <span className="text-gray-500 dark:text-gray-400 text-sm">Belum Dinilai</span>
                    }
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    <button
                      onClick={() => onViewReport(report.id)} // New button for structured view
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-sm p-1 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      title="Lihat Laporan"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Laporan</span> {/* Renamed from Preview */}
                    </button>
                    <button
                      onClick={() => openTextContent(report)}
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-sm p-1 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      title="Tampilkan Teks Laporan"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Teks Laporan</span> {/* Renamed from Preview */}
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(report)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Unduh PDF"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                    {showActionsColumn && (
                      <>
                        <button
                          onClick={() => {
                            setCurrentReport(report);
                            setCurrentView('create');
                          }}
                          className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 text-sm p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          title="Edit Laporan"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <p className="text-gray-500 text-center py-8">Belum ada laporan tersimpan</p>
          )}
        </div>
      </div>



      {/* Foundation Evaluation Detail Modal */}
      {showEvaluationModal && selectedReportForEvaluation && (
        <FoundationEvaluationDetailModal
          report={selectedReportForEvaluation}
          allDetailedEvaluationItems={allDetailedEvaluationItems}
          getAverageEvaluationScore={getAveragePerformance}
          onClose={closeEvaluationModal}
        />
      )}

      {/* Report Text Content Modal */}
      {showTextContent && selectedReportForText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Preview Laporan</h2>
              <button
                onClick={closeTextContent}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ReportTextContent
                report={selectedReportForText}
                allDetailedEvaluationItems={allDetailedEvaluationItems}
                getAverageEvaluationScore={getAveragePerformance}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;