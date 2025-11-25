import React from 'react';
import { ReportData, DetailedEvaluationItem, reportPeriodOptions, ReportPeriodKey } from '../types/report';

interface ReportTextContentProps {
  report: ReportData;
  allDetailedEvaluationItems: DetailedEvaluationItem[];
  getAverageEvaluationScore: (evaluation: { [itemId: string]: number }) => number;
}

const ReportTextContent: React.FC<ReportTextContentProps> = ({
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

  const renderEvaluationText = (evaluation: { [itemId: string]: number }, title: string) => {
    let content = `\n${title}:\n`;
    content += '='.repeat(50) + '\n';
    
    Object.entries(groupedEvaluationItems).forEach(([bidang, kategoriGroup]) => {
      content += `\n${bidang.toUpperCase()}\n`;
      content += '-'.repeat(30) + '\n';
      
      Object.entries(kategoriGroup).forEach(([kategori, items]) => {
        content += `\n  ${kategori}:\n`;
        
        items.forEach((item) => {
          const score = evaluation[item.id];
          content += `    • ${item.item}: ${score !== undefined ? `${score}%` : 'Tidak dinilai'}\n`;
        });
      });
    });
    
    const avgScore = getAverageEvaluationScore(evaluation);
    content += `\n  Rata-rata Skor: ${avgScore.toFixed(1)}%\n`;
    
    return content;
  };

  const generateReportText = () => {
    let reportText = '';
    
    // Header
    reportText += '='.repeat(80) + '\n';
    reportText += 'LAPORAN KEGIATAN KEPALA SEKOLAH\n';
    reportText += '='.repeat(80) + '\n';
    reportText += `${report.principalName} - ${report.schoolName}\n`;
    reportText += '='.repeat(80) + '\n\n';
    
    // Basic Information
    reportText += 'INFORMASI DASAR\n';
    reportText += '-'.repeat(20) + '\n';
    reportText += `ID Laporan        : ${report.id}\n`;
    reportText += `Tanggal           : ${report.date}\n`;
    reportText += `Kepala Sekolah    : ${report.principalName}\n`;
    reportText += `Sekolah           : ${report.schoolName}\n`;
    reportText += `Periode           : ${reportPeriodOptions[report.period as ReportPeriodKey] || report.period}\n`;
    reportText += `Status            : ${report.status === 'submitted' ? 'Terkirim' : report.status === 'approved' ? 'Disetujui' : 'Draft'}\n`;
    
    if (report.submittedAt) {
      reportText += `Tanggal Dikirim   : ${new Date(report.submittedAt).toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}\n`;
    }
    
    // Activities
    reportText += '\n\nKEGIATAN YANG DILAKUKAN\n';
    reportText += '-'.repeat(30) + '\n';
    reportText += `Total Kegiatan: ${report.activities.length}\n\n`;
    
    if (report.activities.length > 0) {
      report.activities.forEach((activity, index) => {
        reportText += `${index + 1}. ${activity.title}\n`;
        reportText += `   Kategori     : ${activity.category}\n`;
        reportText += `   Tanggal      : ${activity.date}\n`;
        reportText += `   Waktu        : ${activity.time || '-'}\n`;
        reportText += `   Lokasi       : ${activity.location}\n`;
        reportText += `   Peserta      : ${activity.participants}\n`;
        reportText += `   Deskripsi    : ${activity.description}\n`;
        
        reportText += `   Hasil        : ${activity.results || '-'}\n`;
        reportText += `   Dampak       : ${activity.impact || '-'}\n`;
        reportText += `   Tantangan    : ${activity.challenges || '-'}\n`;
        reportText += `   Solusi       : ${activity.solutions || '-'}\n`;
        reportText += `   Rencana Tindak Lanjut: ${activity.followUpPlan || '-'}\n`;
        reportText += '\n';
      });
    } else {
      reportText += 'Tidak ada kegiatan yang dilaporkan.\n';
    }
    
    // Principal's Self-Evaluation
    if (report.principalEvaluation && Object.keys(report.principalEvaluation).length > 0) {
      reportText += renderEvaluationText(report.principalEvaluation, 'EVALUASI DIRI KEPALA SEKOLAH');
    }
    
    if (report.foundationEvaluation && Object.keys(report.foundationEvaluation).length > 0) {
      reportText += renderEvaluationText(report.foundationEvaluation, 'EVALUASI YAYASAN');
    }
    
    // Additional sections can be added here if needed
    
    // Footer
    reportText += '\n\n' + '='.repeat(80) + '\n';
    reportText += `Laporan dibuat pada: ${new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n`;
    reportText += '='.repeat(80) + '\n';
    
    return reportText;
  };

  const handleCopyToClipboard = () => {
    const textContent = generateReportText();
    navigator.clipboard.writeText(textContent).then(() => {
      alert('Konten laporan berhasil disalin ke clipboard!');
    }).catch(() => {
      alert('Gagal menyalin konten. Silakan coba lagi.');
    });
  };

  const handleDownloadText = () => {
    const textContent = generateReportText();
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_${report.principalName.replace(/[^a-zA-Z0-9]/g, '_')}_${report.date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Konten Laporan (Teks)</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            📋 Salin Teks
          </button>
          <button
            onClick={handleDownloadText}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            📄 Unduh TXT
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded border">
        <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 overflow-x-auto">
          {generateReportText()}
        </pre>
      </div>
    </div>
  );
};

export default ReportTextContent;