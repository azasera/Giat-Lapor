import React, { useCallback, useMemo } from 'react';
import { X, Star, User } from 'lucide-react';
import { ReportData, DetailedEvaluationItem, reportPeriodOptions, ReportPeriodKey } from '../types/report';
import Tabs from './Tabs';

interface FoundationEvaluationDetailModalProps {
  report: ReportData;
  allDetailedEvaluationItems: DetailedEvaluationItem[];
  getAverageEvaluationScore: (evaluation: { [itemId: string]: number }) => number;
  onClose: () => void;
}

const FoundationEvaluationDetailModal: React.FC<FoundationEvaluationDetailModalProps> = ({
  report,
  allDetailedEvaluationItems,
  getAverageEvaluationScore,
  onClose,
}) => {
  const { principalEvaluation, foundationEvaluation, foundationComment, principalName, schoolName, date, period } = report;

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

  // Calculate average scores per Bidang for Principal's Self-Evaluation
  const principalAverageScoresPerBidang = useMemo(() => {
    const scores: { [bidang: string]: number[] } = {};
    Object.entries(principalEvaluation).forEach(([itemId, score]) => {
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
  }, [principalEvaluation, allDetailedEvaluationItems]);

  // Prepare tabs data for the Tabs component for Principal's Self-Evaluation
  // This will now show a summary per bidang instead of detailed items
  const principalEvaluationTabs = useMemo(() => {
    return Object.entries(groupedEvaluationItems).map(([bidang]) => ({
      id: `principal-${bidang}`,
      label: bidang,
      content: (
        <div className="space-y-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{bidang}</p>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
              {(principalAverageScoresPerBidang[bidang] * 10).toFixed(0)}%
            </span>
          </div>
        </div>
      ),
    }));
  }, [groupedEvaluationItems, principalAverageScoresPerBidang]);


  // Prepare tabs data for the Tabs component for Foundation's Evaluation
  const foundationEvaluationTabs = useMemo(() => {
    return Object.entries(groupedEvaluationItems).map(([bidang, kategoriGroup]) => ({
      id: `foundation-${bidang}`,
      label: bidang,
      content: (
        <div className="space-y-4">
          {Object.entries(kategoriGroup).map(([kategori, items]) => (
            <div key={kategori} className="mb-4 ml-4 border-l-4 border-amber-300 pl-4">
              <h6 className="text-md font-semibold text-gray-800 dark:text-white mb-2">{kategori}</h6>
              <div className="space-y-3">
                {items.map((item) => {
                  const score = foundationEvaluation?.[item.id];
                  const description = item.bobotOptions.find(opt => opt.score === score)?.description || 'Belum dinilai';
                  return (
                    <div key={item.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                      <p className="text-sm text-gray-700 dark:text-gray-200">{item.item}</p>
                      <span className="font-medium text-amber-700 dark:text-amber-300 text-sm">
                        {score !== undefined ? `${score}% - ${description}` : 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ),
    }));
  }, [groupedEvaluationItems, foundationEvaluation]);

  const averagePrincipalPerformance = getAverageEvaluationScore(principalEvaluation);
  const averageFoundationPerformance = foundationEvaluation && Object.keys(foundationEvaluation).length > 0
    ? getAverageEvaluationScore(foundationEvaluation)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detail Penilaian Laporan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{principalName} - {schoolName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Tanggal: {date} | Periode: {reportPeriodOptions[period as ReportPeriodKey] || period}</p>
          </div>

          {/* Principal's Self-Evaluation Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-emerald-200 dark:border-emerald-700">
            <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" /> Penilaian Diri Kepala Sekolah
            </h4>
            <Tabs tabs={principalEvaluationTabs} defaultActiveTabId={principalEvaluationTabs.length > 0 ? principalEvaluationTabs[0].id : ''} />
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                Rata-rata Kinerja Diri: {(averagePrincipalPerformance * 10).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Foundation's Evaluation Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-amber-200 dark:border-amber-700">
            <h4 className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" /> Penilaian Yayasan
            </h4>
            {foundationEvaluation && Object.keys(foundationEvaluation).length > 0 ? (
              <>
                <Tabs tabs={foundationEvaluationTabs} defaultActiveTabId={foundationEvaluationTabs.length > 0 ? foundationEvaluationTabs[0].id : ''} />
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-200 font-medium">
                    Rata-rata Kinerja (Penilaian Yayasan): {(averageFoundationPerformance * 10).toFixed(0)}%
                  </p>
                </div>
                {foundationComment && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Komentar Yayasan:</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{foundationComment}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada penilaian dari Yayasan untuk laporan ini.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationEvaluationDetailModal;