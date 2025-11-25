import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import OptimizedInput from '../components/OptimizedInput';
import OptimizedSelect from '../components/OptimizedSelect';
import { RABData, defaultRABData, ExpenseItem, sourceOfFundOptions, unitTypeOptions, weekNumberOptions, SourceOfFund, UnitType, WeekNumber } from '../types/rab';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle, Send, XCircle, Check, Eye } from 'lucide-react'; // Added XCircle, Check, Eye icons
import { useNavigate } from 'react-router-dom';
import { supabase, fetchRABs, saveRABToSupabase, deleteRABFromSupabase, submitRABToFoundation, approveRAB, rejectRAB } from '../services/supabaseService'; // Import approveRAB, rejectRAB
import SignaturePad, { SignaturePadRef } from '../components/SignaturePad'; // Import SignaturePad and its ref type
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast'; // Import toast utilities

interface RABPageProps {
  initialRABId?: string;
  onRABSaved?: () => void;
  onRABDeleted?: () => void; // Not used in this context, but kept for consistency
  userRole?: 'principal' | 'foundation' | 'admin'; // Add userRole prop
}

const RABPage: React.FC<RABPageProps> = ({ initialRABId, onRABSaved, userRole = 'principal' }) => {
  const [rabData, setRabData] = useState<RABData>(defaultRABData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Replaced by toast
  const [reviewComment, setReviewComment] = useState<string>(''); // State for foundation review comment
  const navigate = useNavigate();

  // Refs for each signature pad
  const kabidUmumSigRef = useRef<SignaturePadRef>(null);
  const bendaharaYayasanSigRef = useRef<SignaturePadRef>(null);
  const sekretarisYayasanSigRef = useRef<SignaturePadRef>(null);
  const ketuaYayasanSigRef = useRef<SignaturePadRef>(null);
  const kepalaMTASigRef = useRef<SignaturePadRef>(null);

  // Determine if the form is read-only for expense items and signatures
  const isEditingAllowedForExpenses = useMemo(() => {
    return (userRole === 'principal' && (rabData.status === 'draft' || rabData.status === 'rejected')) || userRole === 'admin';
  }, [userRole, rabData.status]);

  // Determine if foundation/admin can review (approve/reject) the RAB
  const isReviewingAllowed = useMemo(() => {
    return (userRole === 'foundation' || userRole === 'admin') && rabData.status === 'submitted';
  }, [userRole, rabData.status]);

  // New memos for granular signature editing permissions
  const canSignKabidUmum = useMemo(() => {
    return (userRole === 'principal' || userRole === 'admin') && (rabData.status === 'draft' || rabData.status === 'rejected');
  }, [userRole, rabData.status]);

  const canSignBendaharaYayasan = useMemo(() => {
    return (userRole === 'foundation' || userRole === 'admin') && rabData.status === 'submitted';
  }, [userRole, rabData.status]);

  const canSignSekretarisYayasan = useMemo(() => {
    return (userRole === 'foundation' || userRole === 'admin') && rabData.status === 'submitted';
  }, [userRole, rabData.status]);

  const canSignKetuaYayasan = useMemo(() => {
    return (userRole === 'foundation' || userRole === 'admin') && rabData.status === 'submitted';
  }, [userRole, rabData.status]);

  const canSignKepalaMTA = useMemo(() => {
    return (userRole === 'principal' || userRole === 'admin') && (rabData.status === 'draft' || rabData.status === 'rejected');
  }, [userRole, rabData.status]);


  // Effect to load RAB data when the component mounts or initialRABId changes
  useEffect(() => {
    const loadRAB = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Anda harus login untuk mengelola RAB.');
        setIsLoading(false);
        return;
      }

      if (initialRABId) {
        try {
          const fetchedRABs = await fetchRABs(user.id, userRole); // Fetch based on userRole
          const foundRAB = fetchedRABs.find(rab => rab.id === initialRABId);
          if (foundRAB) {
            setRabData(foundRAB);
            setReviewComment(foundRAB.reviewComment || ''); // Set initial review comment
          } else {
            showError('RAB tidak ditemukan atau Anda tidak memiliki akses.');
            // If RAB not found or no access, navigate back to list
            navigate('/rab-list');
            return;
          }
        } catch (error) {
          console.error('Error fetching specific RAB:', error);
          showError('Gagal memuat RAB. Silakan coba lagi.');
          navigate('/rab-list');
          return;
        }
      } else {
        setRabData({ ...defaultRABData, user_id: user.id });
        setReviewComment('');
      }
      setIsLoading(false);
    };

    loadRAB();
  }, [initialRABId, userRole, navigate]);

  const updateRABInfo = useCallback((field: keyof RABData, value: string) => {
    setRabData(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculateAmount = useCallback((volume: number | '', unitPrice: number | ''): number => {
    const vol = typeof volume === 'number' ? volume : parseFloat(volume as string);
    const price = typeof unitPrice === 'number' ? unitPrice : parseFloat(unitPrice as string);
    if (isNaN(vol) || isNaN(price) || vol <= 0 || price <= 0) return 0;
    return vol * price;
  }, []);

  const updateExpenseItem = useCallback((type: 'routine' | 'incidental', id: string, field: keyof ExpenseItem, value: string | number) => {
    setRabData(prev => {
      const expenseKey = type === 'routine' ? 'routineExpenses' : 'incidentalExpenses';
      const updatedExpenses = prev[expenseKey].map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'volume' || field === 'unitPrice') {
            updatedItem.amount = calculateAmount(updatedItem.volume, updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      });

      // AUTO ADD ROW LOGIC: Jika baris terakhir mulai diisi, tambah baris baru
      const lastItem = updatedExpenses[updatedExpenses.length - 1];
      const isLastItemBeingFilled = lastItem && lastItem.id === id && (
        (field === 'description' && value.toString().trim() !== '') ||
        (field === 'volume' && value !== '') ||
        (field === 'unitPrice' && value !== '')
      );

      if (isLastItemBeingFilled) {
        // Cek apakah sudah ada baris kosong di akhir
        const hasEmptyRowAtEnd = updatedExpenses.length > 1 && 
          updatedExpenses[updatedExpenses.length - 1].description === '' &&
          updatedExpenses[updatedExpenses.length - 1].volume === '' &&
          updatedExpenses[updatedExpenses.length - 1].unitPrice === '';

        if (!hasEmptyRowAtEnd) {
          const newId = `${type === 'routine' ? 'RUT' : 'INC'}-${Date.now()}`;
          const newItem: ExpenseItem = {
            id: newId,
            description: '',
            volume: '',
            unit: type === 'incidental' ? 'pcs/unit' : '',
            unitPrice: '',
            amount: 0,
            sourceOfFund: type === 'incidental' ? 'Yayasan' : '',
            estimatedWeek: type === 'incidental' ? 'Pekan 1' : '',
          };
          updatedExpenses.push(newItem);
        }
      }

      return { ...prev, [expenseKey]: updatedExpenses };
    });
  }, [calculateAmount]);

  const addExpenseItem = useCallback((type: 'routine' | 'incidental') => {
    setRabData(prev => {
      const newId = `${type === 'routine' ? 'RUT' : 'INC'}-${Date.now()}`;
      const newItem: ExpenseItem = {
        id: newId,
        description: '',
        volume: '',
        unit: type === 'incidental' ? 'pcs/unit' : '',
        unitPrice: '',
        amount: 0,
        sourceOfFund: type === 'incidental' ? 'Yayasan' : '',
        estimatedWeek: type === 'incidental' ? 'Pekan 1' : '',
      };
      return { ...prev, [type === 'routine' ? 'routineExpenses' : 'incidentalExpenses']: [...prev[type === 'routine' ? 'routineExpenses' : 'incidentalExpenses'], newItem] };
    });
  }, []);

  const removeExpenseItem = useCallback((type: 'routine' | 'incidental', id: string) => {
    setRabData(prev => {
      const expenseKey = type === 'routine' ? 'routineExpenses' : 'incidentalExpenses';
      let filteredExpenses = prev[expenseKey].filter(item => item.id !== id);
      
      // Pastikan selalu ada minimal 1 baris
      if (filteredExpenses.length === 0) {
        const newId = `${type === 'routine' ? 'RUT' : 'INC'}-${Date.now()}`;
        filteredExpenses = [{
          id: newId,
          description: '',
          volume: '',
          unit: type === 'incidental' ? 'pcs/unit' : '',
          unitPrice: '',
          amount: 0,
          sourceOfFund: type === 'incidental' ? 'Yayasan' : '',
          estimatedWeek: type === 'incidental' ? 'Pekan 1' : '',
        }];
      }
      
      return { ...prev, [expenseKey]: filteredExpenses };
    });
  }, []);

  const totalRoutineExpenses = useMemo(() => {
    return rabData.routineExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [rabData.routineExpenses]);

  const totalIncidentalExpenses = useMemo(() => {
    return rabData.incidentalExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [rabData.incidentalExpenses]);

  const weeklySummary = useMemo(() => {
    const summary: { [key in SourceOfFund]: number[] } = {
      'Yayasan': [0, 0, 0, 0, 0],
      'Bos': [0, 0, 0, 0, 0],
      'Komite': [0, 0, 0, 0, 0],
      'Donasi': [0, 0, 0, 0, 0],
      '': [0, 0, 0, 0, 0], // For items without a source selected
    };

    [...rabData.routineExpenses, ...rabData.incidentalExpenses].forEach(item => {
      if (item.sourceOfFund && item.estimatedWeek) {
        const weekIndex = parseInt(item.estimatedWeek.replace('Pekan ', '')) - 1;
        if (weekIndex >= 0 && weekIndex < 5) {
          summary[item.sourceOfFund][weekIndex] += item.amount;
        }
      }
    });

    const totalPerWeek = summary['Yayasan'].map((_, i) =>
      summary['Yayasan'][i] + summary['Bos'][i] + summary['Komite'][i] + summary['Donasi'][i]
    );

    return {
      yayasan: summary['Yayasan'],
      bos: summary['Bos'],
      komite: summary['Komite'],
      donasi: summary['Donasi'],
      total: totalPerWeek,
    };
  }, [rabData.routineExpenses, rabData.incidentalExpenses]);

  const updateSignature = useCallback((signerKey: keyof RABData, dataUrl: string) => {
    setRabData(prev => ({ ...prev, [signerKey]: dataUrl === '' ? null : dataUrl }));
  }, []);

  const handleSaveRAB = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Anda harus login untuk menyimpan RAB.');
      return;
    }

    const loadingToastId = showLoading('Menyimpan RAB...');
    setIsSaving(true);
    try {
      const saved = await saveRABToSupabase({ ...rabData, reviewComment: reviewComment }, user.id); // Include reviewComment
      setRabData(saved); // Update with the saved version (with ID from DB)
      showSuccess('RAB berhasil disimpan!');
      onRABSaved?.(); // Call callback to return to list
    } catch (error) {
      console.error('Gagal menyimpan RAB:', error);
      showError('Gagal menyimpan RAB. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSaving(false);
    }
  }, [rabData, reviewComment, onRABSaved]);

  const handleSubmitToFoundation = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Anda harus login untuk mengirim RAB.');
      return;
    }

    if (!rabData.id || rabData.id.trim() === '') {
      showError('Silakan simpan RAB terlebih dahulu sebelum mengirim ke yayasan.');
      return;
    }

    // Validate that there are expense items
    if (rabData.routineExpenses.length === 0 && rabData.incidentalExpenses.length === 0) {
      showError('RAB harus memiliki setidaknya satu item belanja sebelum dikirim ke yayasan.');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin mengirim RAB ini ke yayasan untuk ditinjau?')) {
      return;
    }

    const loadingToastId = showLoading('Mengirim RAB ke yayasan...');
    setIsSubmitting(true);
    try {
      const submitted = await submitRABToFoundation(rabData.id, user.id);
      setRabData(submitted);
      showSuccess('RAB berhasil dikirim ke yayasan untuk ditinjau!');
      // After successful submission, go back to list
      setTimeout(() => {
        onRABSaved?.();
      }, 1000); // Small delay to let user read the success message
    } catch (error) {
      console.error('Gagal mengirim RAB ke yayasan:', error);
      showError('Gagal mengirim RAB ke yayasan. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSubmitting(false);
    }
  }, [rabData, onRABSaved]);

  const handleApproveRAB = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !rabData.id) {
      showError('Anda harus login dan memilih RAB untuk menyetujui.');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin MENYETUJUI RAB ini?')) {
      return;
    }

    const loadingToastId = showLoading('Menyetujui RAB...');
    setIsSaving(true);
    try {
      const approved = await approveRAB(rabData.id, user.id, reviewComment);
      setRabData(approved);
      showSuccess('RAB berhasil disetujui!');
      onRABSaved?.(); // Go back to list
    } catch (error) {
      console.error('Gagal menyetujui RAB:', error);
      showError('Gagal menyetujui RAB. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSaving(false);
    }
  }, [rabData, reviewComment, onRABSaved]);

  const handleRejectRAB = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !rabData.id) {
      showError('Anda harus login dan memilih RAB untuk menolak.');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin MENOLAK RAB ini? RAB akan dikembalikan ke status draft.')) {
      return;
    }

    const loadingToastId = showLoading('Menolak RAB...');
    setIsSaving(true);
    try {
      const rejected = await rejectRAB(rabData.id, user.id, reviewComment);
      setRabData(rejected);
      showSuccess('RAB berhasil ditolak dan dikembalikan ke status draft.');
      onRABSaved?.(); // Go back to list
    } catch (error) {
      console.error('Gagal menolak RAB:', error);
      showError('Gagal menolak RAB. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSaving(false);
    }
  }, [rabData, reviewComment, onRABSaved]);

  const renderExpenseTable = (expenses: ExpenseItem[], type: 'routine' | 'incidental') => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs">
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[20%]">Uraian Kegiatan</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[8%]">Volume</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[10%]">Satuan</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[12%]">Harga Satuan</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[12%]">Jumlah</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[12%]">Sumber Dana</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left w-[12%]">Perkiraan Waktu Belanja</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2 text-center w-[8%]">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-gray-300 dark:border-gray-600 p-1">
                <OptimizedInput
                  type="textarea"
                  value={item.description}
                  onChange={(val) => updateExpenseItem(type, item.id, 'description', val)}
                  className="w-full p-1 text-xs border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                  rows={1}
                  readOnly={!isEditingAllowedForExpenses || isSaving}
                />
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-1">
                <OptimizedInput
                  type="number"
                  value={item.volume === 0 ? '' : item.volume}
                  onChange={(val) => updateExpenseItem(type, item.id, 'volume', val === '' ? '' : parseFloat(val))}
                  className="w-full p-1 text-xs border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                  readOnly={!isEditingAllowedForExpenses || isSaving}
                />
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-1">
                <OptimizedSelect
                  value={item.unit}
                  onChange={(val) => updateExpenseItem(type, item.id, 'unit', val as UnitType)}
                  className="w-full p-1 text-xs border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                  readOnly={!isEditingAllowedForExpenses || isSaving}
                >
                  <option value="">Pilih</option>
                  {unitTypeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </OptimizedSelect>
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-1">
                <OptimizedInput
                  type="number"
                  value={item.unitPrice === 0 ? '' : item.unitPrice}
                  onChange={(val) => updateExpenseItem(type, item.id, 'unitPrice', val === '' ? '' : parseFloat(val))}
                  className="w-full p-1 text-xs border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                  readOnly={!isEditingAllowedForExpenses || isSaving}
                />
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-1 text-right bg-gray-50 dark:bg-gray-700">
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  {item.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </span>
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-1">
                <OptimizedSelect
                  value={item.sourceOfFund}
                  onChange={(val) => updateExpenseItem(type, item.id, 'sourceOfFund', val as SourceOfFund)}
                  className="w-full p-1 text-xs border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                  readOnly={!isEditingAllowedForExpenses || isSaving}
                >
                  <option value="">Pilih</option>
                  {sourceOfFundOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </OptimizedSelect>
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-1">
                <OptimizedSelect
                  value={item.estimatedWeek}
                  onChange={(val) => updateExpenseItem(type, item.id, 'estimatedWeek', val as WeekNumber)}
                  className="w-full p-1 text-xs border-none focus:ring-0 dark:bg-gray-800 dark:text-white"
                  readOnly={!isEditingAllowedForExpenses || isSaving}
                >
                  <option value="">Pilih</option>
                  {weekNumberOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </OptimizedSelect>
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-1 text-center">
                {isEditingAllowedForExpenses && (
                  <button
                    onClick={() => removeExpenseItem(type, item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Hapus item"
                    disabled={isSaving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isEditingAllowedForExpenses && (
        <button
          onClick={() => addExpenseItem(type)}
          className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md flex items-center space-x-1"
          disabled={isSaving}
        >
          <Plus className="w-3 h-3" />
          <span>Tambah Baris</span>
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
        <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Memuat RAB...</span>
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
          RENCANA ANGGARAN BELANJA
        </h1>
        <div className="w-24"></div> {/* Placeholder for alignment */}
      </div>

      {/* RAB Status Display */}
      {rabData.id && (
        <div className="mb-6 text-center">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            rabData.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            rabData.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            rabData.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            Status RAB: {rabData.status === 'submitted' ? 'Dikirim' :
                         rabData.status === 'approved' ? 'Disetujui' :
                         rabData.status === 'rejected' ? 'Ditolak' :
                         'Draft'}
          </span>
          {rabData.submittedAt && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dikirim pada: {new Date(rabData.submittedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
          {rabData.reviewedAt && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ditinjau pada: {new Date(rabData.reviewedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
        </div>
      )}

      {/* Read-Only Mode Indicator for Principal */}
      {userRole === 'principal' && (rabData.status === 'submitted' || rabData.status === 'approved') && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Mode Tampilan Saja
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {rabData.status === 'submitted' 
                  ? 'RAB sedang ditinjau oleh yayasan. Anda tidak dapat mengedit saat ini.'
                  : 'RAB sudah disetujui. Anda tidak dapat mengedit RAB yang sudah disetujui.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Notice for Principal */}
      {userRole === 'principal' && rabData.status === 'rejected' && rabData.reviewComment && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start space-x-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                RAB Ditolak oleh Yayasan
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                <span className="font-medium">Alasan:</span> {rabData.reviewComment}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Silakan perbaiki RAB sesuai catatan di atas, lalu kirim ulang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Institution Info & Weekly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Institution Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium text-gray-700 dark:text-gray-300">Nama Lembaga</div>
            <div>
              <OptimizedInput
                type="text"
                value={rabData.institutionName}
                onChange={(val) => updateRABInfo('institutionName', val)}
                className="w-full p-1 text-sm border-b border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:border-emerald-500 dark:text-white"
                readOnly={!isEditingAllowedForExpenses || isSaving}
              />
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300">Periode</div>
            <div>
              <OptimizedInput
                type="text"
                value={rabData.period}
                onChange={(val) => updateRABInfo('period', val)}
                className="w-full p-1 text-sm border-b border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:border-emerald-500 dark:text-white"
                readOnly={!isEditingAllowedForExpenses || isSaving}
              />
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300">Tahun</div>
            <div>
              <OptimizedInput
                type="text"
                value={rabData.year}
                onChange={(val) => updateRABInfo('year', val)}
                className="w-full p-1 text-sm border-b border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:border-emerald-500 dark:text-white"
                readOnly={!isEditingAllowedForExpenses || isSaving}
              />
            </div>
          </div>
        </div>

        {/* Weekly Budget Summary */}
        <div className="overflow-x-auto">
          <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">Ringkasan Kebutuhan Dana Per Pekan</h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-500 text-white">
                <th className="border border-emerald-400 p-2 text-left">Sumber Dana</th>
                {weekNumberOptions.map(week => (
                  <th key={week} className="border border-emerald-400 p-2 text-right">{week}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(weeklySummary).map(([source, amounts]) => (
                <tr key={source} className={source === 'total' ? 'font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'bg-white dark:bg-gray-800'}>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-gray-700 dark:text-gray-200">
                    {source === 'total' ? 'Jumlah' : source.charAt(0).toUpperCase() + source.slice(1)}
                  </td>
                  {amounts.map((amount, idx) => (
                    <td key={idx} className="border border-gray-300 dark:border-gray-600 p-2 text-right text-gray-800 dark:text-gray-100">
                      {amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Belanja Rutin */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-3 text-emerald-600">A. Belanja Rutin</h3>
        {renderExpenseTable(rabData.routineExpenses, 'routine')}
        <div className="flex justify-end mt-2">
          <span className="font-bold text-md text-gray-800 dark:text-gray-100">
            Sub Total: {totalRoutineExpenses.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
          </span>
        </div>
      </div>

      {/* Belanja Insidentil */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-3 text-emerald-600">
          B. Belanja Insidentil <span className="text-sm text-gray-500 dark:text-gray-400">(*wajib sebutkan kegiatan apa yang di akan di adakan)</span>
        </h3>
        {renderExpenseTable(rabData.incidentalExpenses, 'incidental')}
        <div className="flex justify-end mt-2">
          <span className="font-bold text-md text-gray-800 dark:text-gray-100">
            Sub Total: {totalIncidentalExpenses.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
          </span>
        </div>
      </div>

      {/* Total Keseluruhan */}
      <div className="flex justify-end mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
        <span className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
          Total Keseluruhan: {(totalRoutineExpenses + totalIncidentalExpenses).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        </span>
      </div>

      {/* Signature Section */}
      <div className="mt-12 text-center text-sm text-gray-700 dark:text-gray-300">
        <p className="mb-8">Pangkalpinang, 25 Juli 2025</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="flex flex-col items-center">
            <SignaturePad
              ref={kabidUmumSigRef}
              initialSignature={rabData.signatureKabidUmum || undefined}
              onSave={(dataUrl) => updateSignature('signatureKabidUmum', dataUrl)}
              readOnly={!canSignKabidUmum || isSaving}
              className="w-full max-w-[250px] mb-2"
            />
            <p className="font-semibold">Novan Herwando, S.E.</p>
            <p>Kabid Umum</p>
          </div>
          <div className="flex flex-col items-center">
            <SignaturePad
              ref={bendaharaYayasanSigRef}
              initialSignature={rabData.signatureBendaharaYayasan || undefined}
              onSave={(dataUrl) => updateSignature('signatureBendaharaYayasan', dataUrl)}
              readOnly={!canSignBendaharaYayasan || isSaving}
              className="w-full max-w-[250px] mb-2"
            />
            <p className="font-semibold">Ikhwan Fadhillah, S.E.</p>
            <p>Bendahara Yayasan</p>
          </div>
          <div className="flex flex-col items-center">
            <SignaturePad
              ref={sekretarisYayasanSigRef}
              initialSignature={rabData.signatureSekretarisYayasan || undefined}
              onSave={(dataUrl) => updateSignature('signatureSekretarisYayasan', dataUrl)}
              readOnly={!canSignSekretarisYayasan || isSaving}
              className="w-full max-w-[250px] mb-2"
            />
            <p className="font-semibold">Fathurrohman, S.E.</p>
            <p>Sekretaris Yayasan</p>
          </div>
          <div className="flex flex-col items-center">
            <SignaturePad
              ref={ketuaYayasanSigRef}
              initialSignature={rabData.signatureKetuaYayasan || undefined}
              onSave={(dataUrl) => updateSignature('signatureKetuaYayasan', dataUrl)}
              readOnly={!canSignKetuaYayasan || isSaving}
              className="w-full max-w-[250px] mb-2"
            />
            <p className="font-semibold">Ustadz Ali Agustian Bahri, Lc.</p>
            <p>Ketua Yayasan</p>
          </div>
          <div className="flex flex-col items-center">
            <SignaturePad
              ref={kepalaMTASigRef}
              initialSignature={rabData.signatureKepalaMTA || undefined}
              onSave={(dataUrl) => updateSignature('signatureKepalaMTA', dataUrl)}
              readOnly={!canSignKepalaMTA || isSaving}
              className="w-full max-w-[250px] mb-2"
            />
            <p className="font-semibold">Azali Abdul Ghani</p>
            <p>Kepala MTA</p>
          </div>
        </div>
      </div>

      {/* Foundation Review Section */}
      {(userRole === 'foundation' || userRole === 'admin') && (rabData.status === 'submitted' || rabData.status === 'approved' || rabData.status === 'rejected') && (
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-bold mb-4 text-amber-600 dark:text-amber-400">Tinjauan Yayasan</h3>
          
          <div className="mb-4">
            <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catatan
            </label>
            <OptimizedInput
              type="textarea"
              value={reviewComment}
              onChange={setReviewComment}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:text-white"
              rows={4}
              placeholder="Berikan catatan atau umpan balik Anda mengenai RAB ini..."
              readOnly={!isReviewingAllowed || isSaving} // Read-only if not allowed to review
            />
          </div>

          {isReviewingAllowed && (
            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
              <button
                onClick={handleRejectRAB}
                className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
                disabled={isSaving}
              >
                <XCircle className="w-5 h-5" />
                <span>{isSaving ? 'Menolak...' : 'Tolak RAB'}</span>
              </button>
              <button
                onClick={handleApproveRAB}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                disabled={isSaving}
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isSaving ? 'Menyetujui...' : 'Setujui RAB'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons for Principal/Admin */}
      {isEditingAllowedForExpenses && (
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleSaveRAB}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            disabled={isSaving || isSubmitting}
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan RAB'}</span>
          </button>

          {rabData.id && rabData.id.trim() !== '' && (rabData.status === 'draft' || rabData.status === 'rejected' || !rabData.status) && (
            <button
              onClick={handleSubmitToFoundation}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              disabled={isSaving || isSubmitting}
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? 'Mengirim...' : (rabData.status === 'rejected' ? 'Kirim Ulang ke Yayasan' : 'Kirim ke Yayasan')}</span>
            </button>
          )}
        </div>
      )}

      {/* Success Message */}
      {/* {showSuccessMessage && ( // Replaced by toast
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <CheckCircle className="w-5 h-5" />
          <span>RAB berhasil disimpan!</span>
        </div>
      )} */}
    </div>
  );
};

export default RABPage;