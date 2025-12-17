import React, { useState, useCallback, useMemo, useEffect } from 'react';
import OptimizedInput from '../components/OptimizedInput';
import { RABRealization, RealizationItem } from '../types/realization';
import { RABData } from '../types/rab';
import { ArrowLeft, Save, Send, Calendar, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { supabase, fetchRABs, saveRealizationToSupabase, submitRealizationToFoundation } from '../services/supabaseService';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast';

interface RABRealizationPageProps {
  initialRealizationId?: string;
  rabId?: string;
  onRealizationSaved?: () => void;
  userRole?: 'principal' | 'foundation' | 'admin';
}

const RABRealizationPage: React.FC<RABRealizationPageProps> = ({
  initialRealizationId,
  rabId,
  onRealizationSaved,
  userRole = 'principal'
}) => {
  const [realizationData, setRealizationData] = useState<RABRealization>({
    id: '',
    rabId: rabId || '',
    user_id: '',
    status: 'in_progress',
    realizationItems: [],
    totalPlanned: 0,
    totalActual: 0,
    variance: 0,
  });
  const [rabData, setRabData] = useState<RABData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isEditingAllowed = useMemo(() => {
    return (userRole === 'principal' && realizationData.status === 'in_progress') || userRole === 'admin';
  }, [userRole, realizationData.status]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Anda harus login untuk mengelola realisasi RAB.');
        setIsLoading(false);
        return;
      }

      // Load RAB data
      if (rabId) {
        try {
          const fetchedRABs = await fetchRABs(user.id, userRole);
          const foundRAB = fetchedRABs.find(rab => rab.id === rabId);
          if (foundRAB) {
            setRabData(foundRAB);
            
            // Initialize realization items from RAB expense items
            const allExpenses = [...foundRAB.routineExpenses, ...foundRAB.incidentalExpenses];
            const totalPlanned = allExpenses.reduce((sum, item) => sum + item.amount, 0);
            
            const items: RealizationItem[] = allExpenses.map(expense => ({
              id: `REAL-${Date.now()}-${Math.random()}`,
              expenseItemId: expense.id,
              description: expense.description,
              plannedAmount: expense.amount,
              actualAmount: 0,
              actualDate: new Date().toISOString().split('T')[0],
              receipt: '',
              notes: '',
            }));

            setRealizationData(prev => ({
              ...prev,
              user_id: user.id,
              rabId: rabId,
              realizationItems: items,
              totalPlanned: totalPlanned,
            }));
          } else {
            showError('RAB tidak ditemukan.');
            navigate('/rab-list');
            return;
          }
        } catch (error) {
          console.error('Error fetching RAB:', error);
          showError('Gagal memuat RAB.');
          navigate('/rab-list');
          return;
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [rabId, userRole, navigate]);

  const updateRealizationItem = useCallback((id: string, field: keyof RealizationItem, value: string | number) => {
    setRealizationData(prev => {
      const updatedItems = prev.realizationItems.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });

      // Recalculate totals
      const totalActual = updatedItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
      const variance = prev.totalPlanned - totalActual;

      return {
        ...prev,
        realizationItems: updatedItems,
        totalActual,
        variance,
      };
    });
  }, []);

  const handleSaveRealization = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Anda harus login untuk menyimpan realisasi.');
      return;
    }

    const loadingToastId = showLoading('Menyimpan realisasi...');
    setIsSaving(true);
    try {
      const saved = await saveRealizationToSupabase(realizationData, user.id);
      setRealizationData(saved);
      showSuccess('Realisasi berhasil disimpan!');
      onRealizationSaved?.();
    } catch (error) {
      console.error('Gagal menyimpan realisasi:', error);
      showError('Gagal menyimpan realisasi. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSaving(false);
    }
  }, [realizationData, onRealizationSaved]);

  const handleSubmitToFoundation = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Anda harus login untuk mengirim realisasi.');
      return;
    }

    if (!realizationData.id || realizationData.id.trim() === '') {
      showError('Silakan simpan realisasi terlebih dahulu sebelum mengirim ke yayasan.');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin mengirim realisasi ini ke yayasan?')) {
      return;
    }

    const loadingToastId = showLoading('Mengirim realisasi ke yayasan...');
    setIsSaving(true);
    try {
      const submitted = await submitRealizationToFoundation(realizationData.id, user.id);
      setRealizationData(submitted);
      showSuccess('Realisasi berhasil dikirim ke yayasan!');
      setTimeout(() => {
        onRealizationSaved?.();
      }, 1000);
    } catch (error) {
      console.error('Gagal mengirim realisasi:', error);
      showError('Gagal mengirim realisasi. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSaving(false);
    }
  }, [realizationData, onRealizationSaved]);

  const handleDownloadPDF = useCallback(() => {
    if (!rabData) return;
    
    const loadingToastId = showLoading('Membuat PDF Realisasi...');
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('REALISASI ANGGARAN BELANJA', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      // Institution Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nama Lembaga: ${rabData.institutionName}`, 14, 25);
      doc.text(`Periode: ${rabData.period}`, 14, 30);
      doc.text(`Tahun: ${rabData.year}`, 14, 35);
      doc.text(`Status: ${realizationData.status === 'submitted' ? 'Dikirim' : realizationData.status === 'approved' ? 'Disetujui' : realizationData.status === 'completed' ? 'Selesai' : 'Dalam Proses'}`, 14, 40);

      let yPos = 50;

      const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

      // Helper to process items
      const processItems = (expenseItems: typeof rabData.routineExpenses) => {
        return expenseItems
          .map(expense => {
            const realization = realizationData.realizationItems.find(r => r.expenseItemId === expense.id);
            if (!realization) return null;
            
            const difference = expense.amount - (realization.actualAmount || 0);
            return [
               expense.description,
               formatCurrency(expense.amount),
               formatCurrency(realization.actualAmount || 0),
               formatCurrency(difference),
               realization.actualDate ? new Date(realization.actualDate).toLocaleDateString('id-ID') : '-',
               realization.notes || '-'
            ];
          })
          .filter(Boolean) as string[][];
      };

      // A. Belanja Rutin
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('A. Belanja Rutin', 14, yPos);
      yPos += 5;

      const routineData = processItems(rabData.routineExpenses);
      
      if (routineData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Uraian', 'Rencana', 'Realisasi', 'Selisih', 'Tanggal', 'Catatan']],
          body: routineData,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25, halign: 'right' },
            2: { cellWidth: 25, halign: 'right' },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 'auto' }
          }
        });
        yPos = (doc as any).lastAutoTable.finalY + 5;
      }

      // B. Belanja Insidentil
      doc.text('B. Belanja Insidentil', 14, yPos);
      yPos += 5;

      const incidentalData = processItems(rabData.incidentalExpenses);
      
      if (incidentalData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Uraian', 'Rencana', 'Realisasi', 'Selisih', 'Tanggal', 'Catatan']],
          body: incidentalData,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25, halign: 'right' },
            2: { cellWidth: 25, halign: 'right' },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 'auto' }
          }
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Summary
      doc.setFontSize(10);
      doc.text(`Total Rencana: ${formatCurrency(realizationData.totalPlanned)}`, 14, yPos);
      yPos += 5;
      doc.text(`Total Realisasi: ${formatCurrency(realizationData.totalActual)}`, 14, yPos);
      yPos += 5;
      doc.text(`Total Selisih: ${formatCurrency(realizationData.variance)}`, 14, yPos);

      // Save
      const fileName = `Realisasi_${rabData.institutionName}_${rabData.period}_${rabData.year}.pdf`;
      doc.save(fileName);
      
      dismissToast(loadingToastId);
      showSuccess('PDF berhasil diunduh!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      dismissToast(loadingToastId);
      showError('Gagal membuat PDF.');
    }
  }, [rabData, realizationData]);

  const handleDownloadExcel = useCallback(() => {
    if (!rabData) return;

    const loadingToastId = showLoading('Membuat Excel Realisasi...');
    try {
      const wb = XLSX.utils.book_new();

      // Info
      const data = [
        ['REALISASI ANGGARAN BELANJA'],
        [],
        ['Nama Lembaga', rabData.institutionName],
        ['Periode', rabData.period],
        ['Tahun', rabData.year],
        ['Status', realizationData.status],
        [],
      ];

      // Helper
      const addRows = (title: string, items: typeof rabData.routineExpenses) => {
        data.push([title]);
        data.push(['Uraian', 'Rencana', 'Realisasi', 'Selisih', 'Tanggal', 'Catatan']);
        
        items.forEach(expense => {
           const realization = realizationData.realizationItems.find(r => r.expenseItemId === expense.id);
           if (realization) {
             data.push([
               expense.description,
               expense.amount,
               realization.actualAmount || 0,
               expense.amount - (realization.actualAmount || 0),
               realization.actualDate || '-',
               realization.notes || '-'
             ]);
           }
        });
        data.push([]);
      };

      addRows('A. BELANJA RUTIN', rabData.routineExpenses);
      addRows('B. BELANJA INSIDENTIL', rabData.incidentalExpenses);

      // Summary
      data.push(['RINGKASAN']);
      data.push(['Total Rencana', realizationData.totalPlanned]);
      data.push(['Total Realisasi', realizationData.totalActual]);
      data.push(['Total Selisih', realizationData.variance]);

      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Formatting width
      ws['!cols'] = [
        { wch: 40 }, // Uraian
        { wch: 15 }, // Rencana
        { wch: 15 }, // Realisasi
        { wch: 15 }, // Selisih
        { wch: 15 }, // Tanggal
        { wch: 30 }  // Catatan
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Realisasi');
      const fileName = `Realisasi_${rabData.institutionName}_${rabData.period}_${rabData.year}.xlsx`;
      XLSX.writeFile(wb, fileName);

      dismissToast(loadingToastId);
      showSuccess('Excel berhasil diunduh!');
    } catch (error) {
       console.error('Error generating Excel:', error);
       dismissToast(loadingToastId);
       showError('Gagal membuat Excel.');
    }
  }, [rabData, realizationData]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
        <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Memuat realisasi...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>
        <h1 className="text-2xl font-bold text-center text-emerald-700 dark:text-emerald-400 flex-grow">
          REALISASI ANGGARAN BELANJA
        </h1>
        <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
             <button
              onClick={handleDownloadPDF}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-l-lg transition-colors tooltip tooltip-bottom"
              title="Download PDF"
            >
              <FileText className="w-5 h-5" />
            </button>
            <div className="w-[1px] bg-gray-200 dark:bg-gray-700"></div>
            <button
              onClick={handleDownloadExcel}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-r-lg transition-colors tooltip tooltip-bottom"
              title="Download Excel"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Status Display */}
      {realizationData.id && (
        <div className="mb-6 text-center">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            realizationData.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            realizationData.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            realizationData.status === 'completed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            Status: {realizationData.status === 'submitted' ? 'Dikirim' :
                     realizationData.status === 'approved' ? 'Disetujui' :
                     realizationData.status === 'completed' ? 'Selesai' :
                     'Dalam Proses'}
          </span>
        </div>
      )}

      {/* RAB Info */}
      {rabData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mb-6">
          <h3 className="font-semibold mb-2">Informasi RAB</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Lembaga:</span> {rabData.institutionName}</div>
            <div><span className="font-medium">Periode:</span> {rabData.period} {rabData.year}</div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Rencana</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {realizationData.totalPlanned.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Realisasi</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {realizationData.totalActual.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${realizationData.variance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <div className="text-sm text-gray-600 dark:text-gray-400">Selisih</div>
          <div className={`text-2xl font-bold ${realizationData.variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {realizationData.variance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
          </div>
        </div>
      </div>

      {/* Realization Items Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs">
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[25%]">Uraian</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-right w-[12%]">Rencana</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-right w-[12%]">Realisasi</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-center w-[10%]">Tanggal</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[20%]">Catatan</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-right w-[10%]">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {realizationData.realizationItems.map((item) => {
              const itemVariance = item.plannedAmount - (item.actualAmount || 0);
              return (
                <tr key={item.id}>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm">
                    {item.description}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-right text-sm bg-gray-50 dark:bg-gray-700">
                    {item.plannedAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-1">
                    <OptimizedInput
                      type="number"
                      value={item.actualAmount || ''}
                      onChange={(val) => updateRealizationItem(item.id, 'actualAmount', val === '' ? 0 : parseFloat(val))}
                      className="w-full p-1 text-xs text-right border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                      readOnly={!isEditingAllowed || isSaving}
                    />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-1">
                    <OptimizedInput
                      type="date"
                      value={item.actualDate}
                      onChange={(val) => updateRealizationItem(item.id, 'actualDate', val)}
                      className="w-full p-1 text-xs border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                      readOnly={!isEditingAllowed || isSaving}
                    />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-1">
                    <OptimizedInput
                      type="textarea"
                      value={item.notes || ''}
                      onChange={(val) => updateRealizationItem(item.id, 'notes', val)}
                      className="w-full p-1 text-xs border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                      rows={1}
                      readOnly={!isEditingAllowed || isSaving}
                    />
                  </td>
                  <td className={`border border-gray-300 dark:border-gray-600 p-2 text-right text-sm font-medium ${
                    itemVariance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {itemVariance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      {isEditingAllowed && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSaveRealization}
            disabled={isSaving}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
          {realizationData.id && realizationData.status === 'in_progress' && (
            <button
              onClick={handleSubmitToFoundation}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>Kirim ke Yayasan</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RABRealizationPage;
