import React from 'react';
import { ReportData, DetailedEvaluationItem, reportPeriodOptions, ReportPeriodKey } from '../types/report';

interface ReportPdfContentProps {
  report: ReportData;
  allDetailedEvaluationItems: DetailedEvaluationItem[];
  getAverageEvaluationScore: (evaluation: { [itemId: string]: number }) => number;
}

const ReportPdfContent: React.FC<ReportPdfContentProps> = ({
  report,
  allDetailedEvaluationItems,
  getAverageEvaluationScore,
}) => {
  // Group evaluation items by Bidang and Kategori for display
  const groupedEvaluationItems = React.useMemo(() => {
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

  return (
    <div className="p-8 bg-white text-gray-900 font-sans text-sm leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
      <h1 className="text-2xl font-bold text-center mb-6">Laporan Kegiatan Kepala Sekolah</h1>
      <h2 className="text-xl font-semibold text-center text-emerald-700 mb-8">{report.principalName} - {report.schoolName}</h2>

      {/* Basic Information */}
      <div className="mb-6 border-b pb-4 border-gray-300">
        <h3 className="text-lg font-bold mb-3 text-emerald-600">Informasi Dasar</h3>
        <table className="w-full text-left">
          <tbody>
            <tr>
              <td className="w-1/3 py-1 font-medium">ID Laporan</td>
              <td className="w-2/3 py-1">{report.id}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Tanggal Laporan</td>
              <td className="py-1">{report.date}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Nama Kepala Sekolah</td>
              <td className="py-1">{report.principalName}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Nama Sekolah</td>
              <td className="py-1">{report.schoolName}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Periode Laporan</td>
              <td className="py-1">{reportPeriodOptions[report.period as ReportPeriodKey] || report.period}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Status</td>
              <td className="py-1">{report.status === 'submitted' ? 'Terkirim' : report.status === 'approved' ? 'Disetujui' : 'Draft'}</td>
            </tr>
            {report.submittedAt && (
              <tr>
                <td className="py-1 font-medium">Dikirim Pada</td>
                <td className="py-1">{new Date(report.submittedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Activities */}
      <div className="mb-6 border-b pb-4 border-gray-300">
        <h3 className="text-lg font-bold mb-3 text-emerald-600">Kegiatan yang Dilaksanakan ({report.activities.length})</h3>
        {report.activities.length > 0 ? (
          report.activities.map((activity, index) => (
            <div key={activity.id} className="mb-4 p-3 border border-gray-200 rounded-md">
              <h4 className="font-semibold text-base mb-2">Kegiatan {index + 1}: {activity.title}</h4>
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr><td className="w-1/3 py-0.5 font-medium">Kategori</td><td className="w-2/3 py-0.5">{activity.category}</td></tr>
                  <tr><td className="py-0.5 font-medium">Deskripsi</td><td className="py-0.5">{activity.description || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Tanggal Pelaksanaan</td><td className="py-0.5">{activity.date}</td></tr>
                  <tr><td className="py-0.5 font-medium">Waktu Pelaksanaan</td><td className="py-0.5">{activity.time || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Lokasi</td><td className="py-0.5">{activity.location || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Pihak Terlibat</td><td className="py-0.5">{activity.involvedParties || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Tujuan</td><td className="py-0.5">{activity.goals || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Hasil</td><td className="py-0.5">{activity.results || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Dampak</td><td className="py-0.5">{activity.impact || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Kendala</td><td className="py-0.5">{activity.challenges || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Solusi</td><td className="py-0.5">{activity.solutions || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Rencana Tindak Lanjut</td><td className="py-0.5">{activity.followUpPlan || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Link Dokumentasi</td><td className="py-0.5">{activity.documentationLink ? <a href={activity.documentationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a> : '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Link Lampiran</td><td className="py-0.5">{activity.attachmentLink ? <a href={activity.attachmentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a> : '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Catatan Tambahan</td><td className="py-0.5">{activity.additionalNotes || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>Tidak ada kegiatan yang dicatat.</p>
        )}
      </div>

      {/* Achievements */}
      <div className="mb-6 border-b pb-4 border-gray-300">
        <h3 className="text-lg font-bold mb-3 text-emerald-600">Prestasi & Pencapaian ({report.achievements.length})</h3>
        {report.achievements.length > 0 ? (
          report.achievements.map((achievement, index) => (
            <div key={achievement.id} className="mb-4 p-3 border border-gray-200 rounded-md">
              <h4 className="font-semibold text-base mb-2">Prestasi {index + 1}: {achievement.title}</h4>
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr><td className="w-1/3 py-0.5 font-medium">Deskripsi</td><td className="w-2/3 py-0.5">{achievement.description || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Dampak</td><td className="py-0.5">{achievement.impact || '-'}</td></tr>
                  <tr><td className="py-0.5 font-medium">Bukti</td><td className="py-0.5">{achievement.evidence || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>Tidak ada prestasi yang dicatat.</p>
        )}
      </div>

      {/* Principal's Self-Evaluation */}
      <div className="mb-6 border-b pb-4 border-gray-300">
        <h3 className="text-lg font-bold mb-3 text-emerald-600">Evaluasi Kinerja Kepala Sekolah (Penilaian Diri)</h3>
        {Object.keys(report.principalEvaluation).length > 0 ? (
          Object.entries(groupedEvaluationItems).map(([bidang, kategoriGroup]) => (
            <div key={bidang} className="mb-4 ml-4 border-l-2 border-emerald-300 pl-3">
              <h4 className="font-semibold text-base mb-2">{bidang}</h4>
              {Object.entries(kategoriGroup).map(([kategori, items]) => (
                <div key={kategori} className="mb-2 ml-2 border-l-2 border-emerald-200 pl-2">
                  <h5 className="font-medium text-sm mb-1">{kategori}</h5>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="w-1/2 py-1 font-medium">Item Penilaian</th>
                        <th className="w-1/6 py-1 font-medium text-right">Skor</th>
                        <th className="w-1/3 py-1 font-medium pl-2">Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => {
                        const score = report.principalEvaluation[item.id];
                        const description = item.bobotOptions.find(opt => opt.score === score)?.description || 'Belum Dinilai';
                        return (
                          <tr key={item.id}>
                            <td className="py-0.5">{item.item}</td>
                            <td className="py-0.5 font-medium text-right">
                              {score !== undefined ? `${(score * 10).toFixed(0)}%` : '-'}
                            </td>
                            <td className="py-0.5 pl-2">{description}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>Belum ada penilaian diri yang dicatat.</p>
        )}
        {Object.keys(report.principalEvaluation).length > 0 && (
          <p className="mt-4 font-bold text-emerald-700">
            Rata-rata Kinerja Diri Keseluruhan: {(getAverageEvaluationScore(report.principalEvaluation) * 10).toFixed(0)}%
          </p>
        )}
      </div>

      {/* Foundation's Evaluation */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-emerald-600">Evaluasi Kinerja Kepala Sekolah (Penilaian Yayasan)</h3>
        {report.foundationEvaluation && Object.keys(report.foundationEvaluation).length > 0 ? (
          Object.entries(groupedEvaluationItems).map(([bidang, kategoriGroup]) => (
            <div key={bidang} className="mb-4 ml-4 border-l-2 border-amber-300 pl-3">
              <h4 className="font-semibold text-base mb-2">{bidang}</h4>
              {Object.entries(kategoriGroup).map(([kategori, items]) => (
                <div key={kategori} className="mb-2 ml-2 border-l-2 border-amber-200 pl-2">
                  <h5 className="font-medium text-sm mb-1">{kategori}</h5>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="w-1/2 py-1 font-medium">Item Penilaian</th>
                        <th className="w-1/6 py-1 font-medium text-right">Skor</th>
                        <th className="w-1/3 py-1 font-medium pl-2">Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => {
                        const score = report.foundationEvaluation?.[item.id];
                        const description = item.bobotOptions.find(opt => opt.score === score)?.description || 'Belum Dinilai';
                        return (
                          <tr key={item.id}>
                            <td className="py-0.5">{item.item}</td>
                            <td className="py-0.5 font-medium text-right">
                              {score !== undefined ? `${(score * 10).toFixed(0)}%` : '-'}
                            </td>
                            <td className="py-0.5 pl-2">{description}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>Belum ada penilaian dari Yayasan.</p>
        )}
        {report.foundationEvaluation && Object.keys(report.foundationEvaluation).length > 0 && (
          <p className="mt-4 font-bold text-amber-700">
            Rata-rata Kinerja Yayasan Keseluruhan: {(getAverageEvaluationScore(report.foundationEvaluation) * 10).toFixed(0)}%
          </p>
        )}
        {report.foundationComment && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-800 mb-2">Komentar Yayasan:</p>
            <p className="text-gray-700 whitespace-pre-wrap">{report.foundationComment}</p>
          </div>
        )}
      </div>

      <div className="text-center mt-10 text-xs text-gray-500">
        <p>Laporan ini dibuat secara otomatis oleh Sistem Pelaporan Kegiatan (Lapor Giat).</p>
        <p>© 2025 Lapor Giat - Dikembangkan dengan penuh amanah</p>
      </div>
    </div>
  );
};

export default ReportPdfContent;