import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData, DetailedEvaluationItem, reportPeriodOptions, ReportPeriodKey } from '../types/report';

interface PdfServiceProps {
  report: ReportData;
  allDetailedEvaluationItems: DetailedEvaluationItem[];
  getAverageEvaluationScore: (evaluation: { [itemId: string]: number }) => number;
}

export class PdfService {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm (210 x 297)
  private pageWidth: number = 210; // A4 width in mm
  private margin: number = 12;
  private fontSize: number = 8.5;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    // Using helvetica with normal style gives a more condensed look
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(this.fontSize);
  }

  private checkPageBreak(additionalHeight: number = 20): void {
    if (this.currentY + additionalHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(text: string, fontSize: number = 14): void {
    this.checkPageBreak(15);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(0, 0, 0);

    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2; // Center align

    this.doc.text(text, x, this.currentY);
    this.currentY += 10;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(this.fontSize);
  }

  private addSubtitle(text: string, fontSize: number = 12): void {
    this.checkPageBreak(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(5, 150, 105); // Green color

    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2; // Center align

    this.doc.text(text, x, this.currentY);
    this.currentY += 8;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(this.fontSize);
    this.doc.setTextColor(0, 0, 0);
  }

  private addAutoTable(data: any[], columns: any[], title?: string): void {
    this.checkPageBreak(30);

    if (title) {
      this.currentY += 3; // Add space before title
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(11);
      this.doc.text(title, this.margin, this.currentY);
      this.currentY += 5;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(this.fontSize);
    }

    const tableWidth = this.pageWidth - (this.margin * 2);
    const availableWidth = tableWidth;

    autoTable(this.doc, {
      startY: this.currentY,
      head: [columns.map((col: any) => col.header)],
      body: data.map(row => columns.map((col: any) => row[col.dataKey] || '')),
      margin: { left: this.margin, right: this.margin },
      tableWidth: availableWidth,
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [5, 150, 105],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2.5,
        font: 'helvetica'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: this.getColumnStyles(columns, availableWidth)
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 4;
  }

  private getColumnStyles(columns: any[], availableWidth: number): any {
    const styles: any = {};

    columns.forEach((col, index) => {
      if (col.width && col.width !== 'auto') {
        styles[index] = {
          cellWidth: Math.min(col.width, availableWidth * 0.4) // Max 40% of available width
        };
      } else {
        styles[index] = {
          cellWidth: 'auto'
        };
      }
    });

    return styles;
  }


  generateReportPdf(props: PdfServiceProps): void {
    const { report, allDetailedEvaluationItems, getAverageEvaluationScore } = props;

    // Header
    this.addTitle('LAPORAN KEGIATAN KEPALA SEKOLAH');
    this.addSubtitle(`${report.principalName} - ${report.schoolName}`);

    // Basic Information Table
    const basicInfoData = [
      { field: 'ID Laporan', value: report.id.substring(0, 16) + '...' },
      { field: 'Tanggal', value: report.date },
      { field: 'Kepala Sekolah', value: report.principalName },
      { field: 'Sekolah', value: report.schoolName },
      { field: 'Periode', value: reportPeriodOptions[report.period as ReportPeriodKey] || report.period },
      { field: 'Status', value: report.status === 'submitted' ? 'Terkirim' : report.status === 'approved' ? 'Disetujui' : 'Draft' },
    ];

    if (report.submittedAt) {
      basicInfoData.push({
        field: 'Tanggal Dikirim',
        value: new Date(report.submittedAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    }

    this.addAutoTable(
      basicInfoData,
      [
        { header: 'Informasi', dataKey: 'field', width: 50 },
        { header: 'Detail', dataKey: 'value', width: 'auto' }
      ],
      'INFORMASI DASAR'
    );

    // Activities Table
    if (report.activities.length > 0) {
      const activitiesData = report.activities.map((activity, index) => ({
        no: index + 1,
        title: activity.title,
        category: activity.category,
        date: activity.date,
        time: activity.time || '-',
        location: activity.location || '-',
        participants: activity.involvedParties || '-',
        description: activity.goals || '-',
        results: activity.results || '-',
        impact: activity.impact || '-',
        challenges: activity.challenges || '-',
        solutions: activity.solutions || '-',
        followUp: activity.followUpPlan || '-'
      }));

      this.addAutoTable(
        activitiesData,
        [
          { header: 'No', dataKey: 'no', width: 12 },
          { header: 'Judul Kegiatan', dataKey: 'title', width: 42 },
          { header: 'Kategori', dataKey: 'category', width: 28 },
          { header: 'Tanggal', dataKey: 'date', width: 20 },
          { header: 'Waktu', dataKey: 'time', width: 18 },
          { header: 'Lokasi', dataKey: 'location', width: 24 },
          { header: 'Peserta', dataKey: 'participants', width: 24 },
          { header: 'Deskripsi', dataKey: 'description', width: 'auto' }
        ],
        `KEGIATAN YANG DILAKUKAN (${report.activities.length})`
      );

      // Additional details table for activities
      const activityDetailsData = report.activities.map((activity, index) => ({
        no: index + 1,
        title: activity.title,
        results: activity.results || '-',
        impact: activity.impact || '-',
        challenges: activity.challenges || '-',
        solutions: activity.solutions || '-',
        followUp: activity.followUpPlan || '-'
      }));

      this.addAutoTable(
        activityDetailsData,
        [
          { header: 'No', dataKey: 'no', width: 12 },
          { header: 'Kegiatan', dataKey: 'title', width: 35 },
          { header: 'Hasil', dataKey: 'results', width: 'auto' },
          { header: 'Dampak', dataKey: 'impact', width: 'auto' },
          { header: 'Tantangan', dataKey: 'challenges', width: 'auto' },
          { header: 'Solusi', dataKey: 'solutions', width: 'auto' },
          { header: 'Rencana Tindak Lanjut', dataKey: 'followUp', width: 'auto' }
        ],
        'DETAIL HASIL DAN DAMPAK KEGIATAN'
      );
    } else {
      this.addAutoTable(
        [{ message: 'Tidak ada kegiatan yang dilaporkan' }],
        [{ header: 'Kegiatan', dataKey: 'message', width: 'auto' }],
        'KEGIATAN YANG DILAKUKAN'
      );
    }

    // Principal's Self-Evaluation
    if (report.principalEvaluation && Object.keys(report.principalEvaluation).length > 0) {
      const evaluationData = this.prepareEvaluationData(report.principalEvaluation, allDetailedEvaluationItems);

      this.addAutoTable(
        evaluationData,
        [
          { header: 'Bidang', dataKey: 'bidang', width: 40 },
          { header: 'Kategori', dataKey: 'kategori', width: 50 },
          { header: 'Item Penilaian', dataKey: 'item', width: 'auto' },
          { header: 'Skor (%)', dataKey: 'score', width: 20 }
        ],
        `EVALUASI DIRI KEPALA SEKOLAH - Rata-rata: ${(getAverageEvaluationScore(report.principalEvaluation) * 10).toFixed(0)}%`
      );
    }

    // Foundation's Evaluation
    if (report.foundationEvaluation && Object.keys(report.foundationEvaluation).length > 0) {
      const foundationEvaluationData = this.prepareEvaluationData(report.foundationEvaluation, allDetailedEvaluationItems);

      this.addAutoTable(
        foundationEvaluationData,
        [
          { header: 'Bidang', dataKey: 'bidang', width: 40 },
          { header: 'Kategori', dataKey: 'kategori', width: 50 },
          { header: 'Item Penilaian', dataKey: 'item', width: 'auto' },
          { header: 'Skor (%)', dataKey: 'score', width: 20 }
        ],
        `EVALUASI YAYASAN - Rata-rata: ${(getAverageEvaluationScore(report.foundationEvaluation) * 10).toFixed(0)}%`
      );
    }

    // Add signatures
    this.addSignatures(report);

    // Add footer
    this.addFooter();
  }

  private prepareEvaluationData(evaluation: { [itemId: string]: number }, allDetailedEvaluationItems: DetailedEvaluationItem[]): any[] {
    const data: any[] = [];

    // Group items by bidang and kategori
    const grouped = this.groupEvaluationItems(allDetailedEvaluationItems);

    Object.entries(grouped).forEach(([bidang, kategoriGroup]: [string, any]) => {
      Object.entries(kategoriGroup).forEach(([kategori, items]: [string, any]) => {
        items.forEach((item: DetailedEvaluationItem) => {
          const score = evaluation[item.id];
          data.push({
            bidang: bidang,
            kategori: kategori,
            item: item.item,
            score: score !== undefined ? `${score}%` : 'Tidak dinilai'
          });
        });
      });
    });

    return data;
  }

  private groupEvaluationItems(allDetailedEvaluationItems: DetailedEvaluationItem[]) {
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
  }

  private addSignatures(report: ReportData): void {
    this.checkPageBreak(60);

    // Add date and location
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.doc.text(`Pangkalpinang, ${currentDate}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;

    // Signature section
    const sigWidth = 40;
    const sigHeight = 25;
    const leftX = this.margin + 20;
    const rightX = this.pageWidth - this.margin - sigWidth - 20;

    // Principal signature (left)
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Kepala Sekolah,', leftX + (sigWidth / 2), this.currentY, { align: 'center' });
    
    if (report.signaturePrincipal) {
      try {
        this.doc.addImage(report.signaturePrincipal, 'PNG', leftX, this.currentY + 3, sigWidth, sigHeight);
      } catch (error) {
        console.error('Error adding principal signature:', error);
      }
    }
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(report.principalName, leftX + (sigWidth / 2), this.currentY + sigHeight + 8, { align: 'center' });

    // Foundation signature (right)
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Yayasan,', rightX + (sigWidth / 2), this.currentY, { align: 'center' });
    
    if (report.signatureFoundation) {
      try {
        this.doc.addImage(report.signatureFoundation, 'PNG', rightX, this.currentY + 3, sigWidth, sigHeight);
      } catch (error) {
        console.error('Error adding foundation signature:', error);
      }
    }
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pihak Yayasan', rightX + (sigWidth / 2), this.currentY + sigHeight + 8, { align: 'center' });

    this.currentY += sigHeight + 15;
  }

  private addFooter(): void {
    this.checkPageBreak(20);

    // Add a separator line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');

    const createdDate = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    this.doc.text(`Laporan dibuat pada: ${createdDate}`, this.margin, this.currentY);
    this.currentY += 4;
    this.doc.text('© 2025 Lapor Giat - Sistem Pelaporan Kegiatan', this.margin, this.currentY);
  }

  downloadPdf(filename?: string): void {
    const defaultFilename = `Laporan_${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename || defaultFilename);
  }
}

export const generateReportPdf = (props: PdfServiceProps, filename?: string): void => {
  const pdfService = new PdfService();
  pdfService.generateReportPdf(props);
  pdfService.downloadPdf(filename);
};
