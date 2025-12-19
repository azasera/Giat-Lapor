import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, FileText, RefreshCw, Eye, Search } from 'lucide-react';
import { MemoData } from '../types/memo';
import { supabase, fetchMemos, deleteMemoFromSupabase } from '../services/supabaseService';
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
        try {
            const fetchedMemos = await fetchMemos(user.id, userRole);
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
                                Daftar Memo Internal
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kelola dan cetak memo resmi sekolah</p>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onEditMemo(memo.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit/Lihat"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMemo(memo.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                        Belum ada memo yang dibuat.
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
