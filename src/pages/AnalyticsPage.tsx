import React, { useMemo } from 'react';
import { BarChart3, User, Star, TrendingUp } from 'lucide-react'; // Import additional icons
import { ReportData, DetailedEvaluationItem } from '../types/report'; // Update import

interface AnalyticsPageProps {
  reports: ReportData[];
  allDetailedEvaluationItems: DetailedEvaluationItem[]; // New prop
  getAverageEvaluationScore: (evaluation: { [itemId: string]: number }) => number; // Update prop name and type
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ reports, allDetailedEvaluationItems, getAverageEvaluationScore }) => {
  // Group evaluation items by Bidang for display in analytics
  const groupedEvaluationItemsByBidang = useMemo(() => {
    const grouped: { [bidang: string]: DetailedEvaluationItem[] } = {};
    allDetailedEvaluationItems.forEach(item => {
      if (!grouped[item.bidang]) {
        grouped[item.bidang] = [];
      }
      grouped[item.bidang].push(item);
    });
    return grouped;
  }, [allDetailedEvaluationItems]);

  // Calculate average scores per Bidang
  const averageScoresPerBidang = useMemo(() => {
    const scores: { [bidang: string]: number[] } = {};
    reports.forEach(report => {
      Object.entries(report.principalEvaluation).forEach(([itemId, score]) => {
        const item = allDetailedEvaluationItems.find(i => i.id === itemId);
        if (item) {
          if (!scores[item.bidang]) {
            scores[item.bidang] = [];
          }
          scores[item.bidang].push(score);
        }
      });
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
  }, [reports, allDetailedEvaluationItems]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Statistik dan Wawasan Kinerja</h2>
        
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart by Bidang */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Rata-rata Kinerja per Bidang</h3>
              <div className="space-y-3">
                {Object.entries(groupedEvaluationItemsByBidang).map(([bidang]) => {
                  const avgScore = averageScoresPerBidang[bidang] || 0;
                  
                  return (
                    <div key={bidang} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{bidang}</span>
                        <span className="text-sm font-bold text-emerald-600">{(avgScore * 10).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                          // eslint-disable-next-line react/forbid-dom-props
                          style={{ width: `${(avgScore / 10) * 100}%` }} // Assuming max score is 10
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Statistik Umum</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-600 dark:text-gray-300">Total Kegiatan</span>
                  <span className="font-bold text-emerald-600">
                    {reports.reduce((acc, r) => acc + r.activities.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-600 dark:text-gray-300">Total Prestasi</span>
                  <span className="font-bold text-amber-600">
                    {reports.reduce((acc, r) => acc + r.achievements.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-600 dark:text-gray-300">Laporan Bulan Ini</span>
                  <span className="font-bold text-teal-600">
                    {reports.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-600 dark:text-gray-300">Tingkat Kepatuhan</span>
                  <span className="font-bold text-purple-600">
                    {reports.length > 0 ? `${((reports.filter(r => r.status !== 'draft').length / reports.length) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada data untuk ditampilkan. Buat laporan pertama Anda!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;