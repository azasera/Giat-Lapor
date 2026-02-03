import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, FileText, RefreshCw, Eye, Search, Copy, Send } from 'lucide-react';
import { MemoData } from '../types/memo';
import { supabase, fetchMemos, deleteMemoFromSupabase, sendMemoToFoundation } from '../services/supabaseService';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast';

interface MemoListPageProps {
    onEditMemo: (memoId: string) => void;
    onCreateNewMemo: () => void;
    userRole?: 'principal' | 'foundation' | 'admin';
}

const MemoListPage: React.FC<MemoListPageProps> = ({ onEditMemo, onCreateNewMemo, userRole = 'principal' }) => {
    const [memos, setMemos] = useState<MemoData[]>([]);
    const [filteredMemos, setFilteredMemos] = useState<MemoData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadMemos = useCallback(async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showError('Anda harus login untuk melihat daftar memo.');
            setIsLoading(false);
            return;
        }

        console.log(`[MemoListPage] Loading memos for user ${user.id} with role ${userRole}`);
        
        try {
            const fetchedMemos = await fetchMemos(user.id, userRole);
            console.log(`[MemoListPage] Fetched ${fetchedMemos.length} memos:`, fetchedMemos.map(m => ({ id: m.id, status: m.status, memo_number: m.memo_number })));
            setMemos(fetchedMemos);
            setFilteredMemos(fetchedMemos);
        } catch (error) {
            console.error('Error fetching memos:', error);
            showError('Gagal memuat daftar memo.');
        } finally {
            setIsLoading(false);
        }
    }, [userRole]);

    useEffect(() => {
        loadMemos();
    }, [loadMemos]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = memos.filter(m =>
            m.memo_number.toLowerCase().includes(term) ||
            m.subject.toLowerCase().includes(term) ||
            m.to.toLowerCase().includes(term)
        );
        setFilteredMemos(filtered);
    }, [searchTerm, memos]);

    const handleDeleteMemo = async (memoId: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus memo ini?')) return;

        const loadingToastId = showLoading('Menghapus memo...');
        try {
            await deleteMemoFromSupabase(memoId);
            showSuccess('Memo berhasil dihapus!');
            loadMemos();
        } catch (error) {
            showError('Gagal menghapus memo.');
        } finally {
            dismissToast(loadingToastId);
        }
    };

    const handleSendToFoundation = async (memoId: string, memoNumber: string) => {
        if (!window.confirm(`Kirim memo "${memoNumber}" ke pihak yayasan? Setelah dikirim, memo tidak dapat diubah lagi.`)) return;

        const loadingToastId = showLoading('Mengirim memo ke yayasan...');
        try {
            await sendMemoToFoundation(memoId);
            showSuccess('Memo berhasil dikirim ke yayasan!');
            loadMemos();
        } catch (error) {
            console.error('Error sending memo to foundation:', error);
            showError('Gagal mengirim memo ke yayasan.');
        } finally {
            dismissToast(loadingToastId);
        }
    };

    const handleDuplicateMemo = async (memoId: string) => {
        if (!window.confirm('Duplikasi memo ini? Salinan baru akan dibuat dengan status Draft.')) return;

        const loadingToastId = showLoading('Menduplikasi memo...');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Fetch the original memo with tables
            const { data: originalMemo, error: fetchError } = await supabase
                .from('memos')
                .select('*, memo_tables(*)')
                .eq('id', memoId)
                .single();

            if (fetchError) throw fetchError;

            // Create new memo (without id)
            const { data: newMemo, error: insertError } = await supabase
                .from('memos')
                .insert([{
                    user_id: user.id,
                    memo_number: originalMemo.memo_number + ' (Copy)',
                    document_title: originalMemo.document_title,
                    subject: originalMemo.subject,
                    from: originalMemo.from,
                    to: originalMemo.to,
                    show_from_to: originalMemo.show_from_to,
                    memo_date: new Date().toISOString().split('T')[0], // Today's date
                    opening: originalMemo.opening,
                    description: originalMemo.description,
                    signatory_name: originalMemo.signatory_name,
                    signatory_role: originalMemo.signatory_role,
                    logo_left_url: originalMemo.logo_left_url,
                    logo_right_url: originalMemo.logo_right_url,
                    signature_url: originalMemo.signature_url,
                    stamp_url: originalMemo.stamp_url,
                    status: 'draft'
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            // Duplicate tables if any
            if (originalMemo.memo_tables && originalMemo.memo_tables.length > 0) {
                const tablesToInsert = originalMemo.memo_tables.map((table: any) => ({
                    memo_id: newMemo.id,
                    title: table.title,
                    headers: table.headers,
                    rows: table.rows,
                    order_index: table.order_index
                }));

                const { error: tablesError } = await supabase
                    .from('memo_tables')
                    .insert(tablesToInsert);

                if (tablesError) throw tablesError;
            }

            showSuccess('Memo berhasil diduplikasi!');
            loadMemos();
        } catch (error) {
            console.error('Error duplicating memo:', error);
            showError('Gagal menduplikasi memo.');
        } finally {
            dismissToast(loadingToastId);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FileText className="w-6 h-6 text-emerald-600" />
                                {userRole === 'foundation' ? 'Memo dari Sekolah' : 'Daftar Memo Internal'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {userRole === 'foundation' 
                                    ? 'Memo dan surat yang dikirim dari sekolah ke yayasan' 
                                    : 'Kelola dan cetak memo resmi sekolah'
                                }
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadMemos}
                                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            {(userRole === 'principal' || userRole === 'admin') && (
                                <button
                                    onClick={onCreateNewMemo}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/10"
                                >
                                    <Plus className="w-4 h-4" />
                                    Buat Memo Baru
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nomor memo, perihal, atau tujuan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nomor Memo</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Perihal</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kepada</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredMemos.length > 0 ? (
                                filteredMemos.map((memo) => (
                                    <tr key={memo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">{memo.memo_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{memo.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{memo.to}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(memo.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                memo.status === 'sent_to_foundation' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                    : memo.status === 'final'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                                            }`}>
                                                {memo.status === 'sent_to_foundation' ? 'Dikirim ke Yayasan' : 
                                                 memo.status === 'final' ? 'Final' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onEditMemo(memo.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit/Lihat"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {memo.status !== 'sent_to_foundation' && (userRole === 'principal' || userRole === 'admin') && (
                                                    <button
                                                        onClick={() => handleSendToFoundation(memo.id, memo.memo_number)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                        title="Kirim ke Yayasan"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDuplicateMemo(memo.id)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="Duplikasi Memo"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                {(userRole === 'principal' || userRole === 'admin') && memo.status !== 'sent_to_foundation' && (
                                                    <button
                                                        onClick={() => handleDeleteMemo(memo.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                        {userRole === 'foundation' ? 'Belum ada memo yang dikirim ke yayasan.' : 'Belum ada memo yang dibuat.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MemoListPage;
