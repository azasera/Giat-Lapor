import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Eye, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RABRealization } from '../types/realization';
import { RABData } from '../types/rab';
import { supabase, fetchRealizations, fetchRABs, deleteRealizationFromSupabase } from '../services/supabaseService';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast';

interface RABRealizationListPageProps {
  onEditRealization: (realizationId: string) => void;
  onCreateNewRealization: (rabId: string) => void;
  userRole?: 'principal' | 'foundation' | 'admin';
}

const RABRealizationListPage: React.FC<RABRealizationListPageProps> = ({
  onEditRealization,
  onCreateNewRealization,
  userRole = 'principal'
}) => {
  const [realizations, setRealizations] = useState<RABRealization[]>([]);
  const [approvedRABs, setApprovedRABs] = useState<RABData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRABSelector, setShowRABSelector] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    console.log(`[RABRealizationListPage] loadData called with userRole: ${userRole}`);
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Anda harus login untuk melihat daftar realisasi.');
      setIsLoading(false);
      return;
    }
    try {
      const fetchedRealizations = await fetchRealizations(user.id, userRole);
      console.log(`[RABRealizationListPage] Fetched ${fetchedRealizations.length} realizations.`);
      setRealizations(fetchedRealizations);

      // Fetch approved RABs for creating new realizations
      const fetchedRABs = await fetchRABs(user.id, userRole);
      const approved = fetchedRABs.filter(rab => rab.status === 'approved');
      setApprovedRABs(approved);
    } catch (error) {
      console.error('[RABRealizationListPage] Error fetching data:', error);
      showError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteRealization = useCallback(async (realizationId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus realisasi ini?')) {
      return;
    }
    const loadingToastId = showLoading('Menghapus realisasi...');
    setIsDeleting(true);
    try {
      await deleteRealizationFromSupabase(realizationId);
      showSuccess('Realisasi berhasil dihapus!');
      loadData();
    } catch (error) {
      console.error('Error deleting realization:', error);
      showError('Gagal menghapus realisasi. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsDeleting(false);
    }
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
        <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Memuat daftar realisasi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Daftar Realisasi Anggaran Belanja</h2>
          <div className="flex space-x-2">
            <button
              onClick={loadData}
              disabled={isDeleting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              title="Refresh daftar"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            {(userRole === 'principal' || userRole === 'admin') && (
              <button
                onClick={() => setShowRABSelector(!showRABSelector)}
                disabled={isDeleting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Realisasi Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* RAB Selector Modal */}
        {showRABSelector && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold mb-3">Pilih RAB yang Sudah Disetujui:</h3>
            {approvedRABs.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tidak ada RAB yang disetujui. Silakan buat dan ajukan RAB terlebih dahulu.
              </p>
            ) : (
              <div className="space-y-2">
                {approvedRABs.map(rab => (
                  <button
                    key={rab.id}
                    onClick={() => {
                      onCreateNewRealization(rab.id);
                      setShowRABSelector(false);
                    }}
                    className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{rab.institutionName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {rab.period} {rab.year}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {(rab.routineExpenses.reduce((sum, item) => sum + item.amount, 0) +
                            rab.incidentalExpenses.reduce((sum, item) => sum + item.amount, 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowRABSelector(false)}
              className="mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Batal
            </button>
          </div>
        )}

        {/* Realizations Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">RAB</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Rencana</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Realisasi</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Selisih</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {realizations.map((realization) => {
                const percentage = realization.totalPlanned > 0 
                  ? ((realization.totalActual / realization.totalPlanned) * 100).toFixed(1)
                  : '0';
                
                return (
                  <tr key={realization.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                      <div className="text-sm">RAB #{realization.rabId.substring(0, 8)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {realization.createdAt && new Date(realization.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800 dark:text-gray-200">
                      {realization.totalPlanned.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800 dark:text-gray-200">
                      <div>{realization.totalActual.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">({percentage}%)</div>
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      realization.variance >= 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {realization.variance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        realization.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        realization.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        realization.status === 'completed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {realization.status === 'submitted' ? 'Dikirim' :
                         realization.status === 'approved' ? 'Disetujui' :
                         realization.status === 'completed' ? 'Selesai' :
                         'Proses'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      {(userRole === 'principal' || userRole === 'admin') && (
                        <>
                          <button
                            onClick={() => onEditRealization(realization.id)}
                            className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 text-sm p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            title="Edit Realisasi"
                            disabled={isDeleting || realization.status !== 'in_progress'}
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteRealization(realization.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Hapus Realisasi"
                            disabled={isDeleting || realization.status !== 'in_progress'}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus</span>
                          </button>
                        </>
                      )}
                      {userRole === 'foundation' && (
                        <button
                          onClick={() => onEditRealization(realization.id)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Lihat Realisasi"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Lihat</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {realizations.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Belum ada realisasi tersimpan. Buat realisasi dari RAB yang sudah disetujui!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RABRealizationListPage;
