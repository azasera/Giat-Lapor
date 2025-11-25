import React from 'react';
import { FileText, Send, BarChart3, Calendar } from 'lucide-react';
import { ReportData } from '../types/report'; // Asumsi types akan dibuat

interface DashboardPageProps {
  reports: ReportData[];
  getAveragePerformance: (evaluation: { [itemId: string]: number }) => number; // Update type
}

const DashboardPage: React.FC<DashboardPageProps> = ({ reports, getAveragePerformance }) => {
  return (
    <div className="space-y-6">
      {/* Islamic Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</h1>
            <p className="text-emerald-100">Sistem Pelaporan Kegiatan</p>
          </div>
          <img src="/Lagi_ikon.png" alt="Lapor Giat Icon" className="w-16 h-16 opacity-20" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Laporan</p>
              <p className="text-2xl font-bold text-emerald-600">{reports.length}</p>
            </div>
            <FileText className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Laporan Terkirim</p>
              <p className="text-2xl font-bold text-amber-600">{reports.filter(r => r.status === 'submitted').length}</p>
            </div>
            <Send className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Rata-rata Kinerja</p>
              <p className="text-2xl font-bold text-teal-600">
                {reports.length > 0 
                  ? ((reports.reduce((acc, r) => acc + getAveragePerformance(r.principalEvaluation), 0) / reports.length) * 10).toFixed(0) + '%'
                  : '0%'
                }
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-teal-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Bulan Ini</p>
              <p className="text-2xl font-bold text-purple-600">
                {reports.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Laporan Terbaru</h3>
        <div className="space-y-3">
          {reports.slice(-5).reverse().map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  report.status === 'submitted' ? 'bg-green-500' : 
                  report.status === 'approved' ? 'bg-blue-500' : 'bg-amber-500' // Changed yellow to amber for consistency
                }`}></div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{report.principalName || 'Draft'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{report.schoolName} - {report.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  report.status === 'submitted' ? 'bg-green-100 text-green-800' : 
                  report.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800' // Changed yellow to amber
                }`}>
                  {report.status === 'submitted' ? 'Terkirim' : 
                   report.status === 'approved' ? 'Disetujui' : 'Draft'}
                </span>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-gray-500 text-center py-8">Belum ada laporan. Mulai buat laporan pertama Anda!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;