import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, FileText, RefreshCw, Send, Eye } from 'lucide-react'; // Import Eye icon
import { useNavigate } from 'react-router-dom';
import { RABData } from '../types/rab';
import { supabase, fetchRABs, deleteRABFromSupabase, submitRABToFoundation } from '../services/supabaseService';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast'; // Import toast utilities

interface RABListPageProps {
  onEditRAB: (rabId: string) => void;
  onCreateNewRAB: () => void;
  userRole?: 'principal' | 'foundation' | 'admin';
}

const RABListPage: React.FC<RABListPageProps> = ({ onEditRAB, onCreateNewRAB, userRole = 'principal' }) => {
  const [rabs, setRabs] = useState<RABData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Track which RAB is being submitted
  const navigate = useNavigate();

  const loadRABs = useCallback(async () => {
    console.log(`[RABListPage] loadRABs called with userRole: ${userRole}`);
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Anda harus login untuk melihat daftar RAB.');
      setIsLoading(false);
      return;
    }
    try {
      const fetchedRABs = await fetchRABs(user.id, userRole);
      console.log(`[RABListPage] Fetched ${fetchedRABs.length} RABs.`);
      setRabs(fetchedRABs);
    } catch (error) {
      console.error('[RABListPage] Error fetching RABs:', error);
      showError('Gagal memuat daftar RAB. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadRABs();
  }, [loadRABs]);

  const handleDeleteRAB = useCallback(async (rabId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus RAB ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }
    const loadingToastId = showLoading('Menghapus RAB...');
    setIsDeleting(true);
    try {
      await deleteRABFromSupabase(rabId);
      showSuccess('RAB berhasil dihapus!');
      loadRABs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting RAB:', error);
      showError('Gagal menghapus RAB. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsDeleting(false);
    }
  }, [loadRABs]);

  const handleSubmitRABToFoundation = useCallback(async (rabId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Anda harus login untuk mengirim RAB.');
      return;
    }

    // Find the RAB to validate
    const rab = rabs.find(r => r.id === rabId);
    if (!rab) {
      showError('RAB tidak ditemukan.');
      return;
    }

    // Note: Signature validation removed - RAB will be sent to foundation for signatures

    // Validate that there are expense items
    if (rab.routineExpenses.length === 0 && rab.incidentalExpenses.length === 0) {
      showError('RAB harus memiliki setidaknya satu item belanja sebelum dikirim ke yayasan.');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin mengirim RAB ini ke yayasan untuk ditinjau?')) {
      return;
    }

    const loadingToastId = showLoading('Mengirim RAB ke yayasan...');
    setIsSubmitting(rabId);
    try {
      await submitRABToFoundation(rabId, user.id);
      showSuccess('RAB berhasil dikirim ke yayasan untuk ditinjau!');
      loadRABs(); // Refresh the list to show updated status
    } catch (error) {
      console.error('Gagal mengirim RAB ke yayasan:', error);
      showError('Gagal mengirim RAB ke yayasan. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsSubmitting(null);
    }
  }, [rabs, loadRABs]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
        <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Memuat daftar RAB...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Daftar Rencana Anggaran Belanja</h2>
          <div className="flex space-x-2">
            <button
              onClick={loadRABs}
              disabled={isDeleting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              title="Refresh daftar RAB"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            {(userRole === 'principal' || userRole === 'admin') && (
              <button
                onClick={onCreateNewRAB}
                disabled={isDeleting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Buat RAB Baru</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Lembaga</th><th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Periode</th><th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tahun</th><th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Anggaran</th><th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th><th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {rabs.map((rab) => (
                <tr key={rab.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{rab.institutionName}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{rab.period}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{rab.year}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {(rab.routineExpenses.reduce((sum, item) => sum + item.amount, 0) +
                      rab.incidentalExpenses.reduce((sum, item) => sum + item.amount, 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${
                        rab.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        rab.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        rab.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {rab.status === 'submitted' ? 'Dikirim' :
                         rab.status === 'approved' ? 'Disetujui' :
                         rab.status === 'rejected' ? 'Ditolak' :
                         'Draft'}
                      </span>
                      {rab.status === 'rejected' && userRole === 'principal' && (
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          ✏️ Bisa diedit untuk perbaikan
                        </span>
                      )}
                      {rab.status === 'rejected' && rab.reviewComment && (
                        <span className="text-xs text-gray-600 dark:text-gray-400 italic">
                          Alasan: {rab.reviewComment}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    {(userRole === 'principal' || userRole === 'admin') && (
                      <>
                        {/* Edit button - only for draft or rejected */}
                        {(rab.status === 'draft' || rab.status === 'rejected' || !rab.status) && (
                          <button
                            onClick={() => onEditRAB(rab.id)}
                            className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 text-sm p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit RAB"
                            disabled={isDeleting || isSubmitting === rab.id}
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* View button - for submitted or approved */}
                        {(rab.status === 'submitted' || rab.status === 'approved') && (
                          <button
                            onClick={() => onEditRAB(rab.id)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Lihat RAB"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Lihat</span>
                          </button>
                        )}

                        {(rab.status === 'draft' || !rab.status) && (
                          <button
                            onClick={() => handleSubmitRABToFoundation(rab.id)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Kirim ke Yayasan"
                            disabled={isDeleting || isSubmitting === rab.id}
                          >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting === rab.id ? 'Mengirim...' : 'Kirim'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRAB(rab.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Hapus RAB"
                          disabled={isDeleting || isSubmitting === rab.id || (userRole === 'principal' && rab.status !== 'draft' && rab.status !== 'rejected')}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
                        </button>
                      </>
                    )}
                    {userRole === 'foundation' && (rab.status === 'submitted' || rab.status === 'approved' || rab.status === 'rejected') && (
                      <button
                        onClick={() => onEditRAB(rab.id)} // Use onEditRAB to view the form
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Tampilkan RAB"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Tampilkan RAB</span> {/* Changed "Lihat" to "Tampilkan RAB" */}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rabs.length === 0 && (
            <p className="text-gray-500 text-center py-8">Belum ada RAB tersimpan. Buat RAB pertama Anda!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RABListPage;