import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Printer, Send, Award, Home } from 'lucide-react';
import {
    SUPERVISION_CATEGORIES,
    TahfidzSupervision,
    TahfidzSupervisionItem,
    getScoreLabel,
    getCategoryColor,
    getPromotionRecommendation,
    getPromotionColor
} from '../types/tahfidzSupervision';
import {
    fetchSupervisionById,
    fetchSupervisionItems,
    sendSupervisionToFoundation,
    deleteSupervisionPhoto,
    removePhotoFromSupervision
} from '../services/tahfidzSupervisionService';
import { supabase } from '../services/supabaseService';
import SupervisionGallery from '../components/SupervisionGallery';

interface TahfidzSupervisionViewPageProps {
    id?: string;
}

const TahfidzSupervisionViewPage: React.FC<TahfidzSupervisionViewPageProps> = ({ id: propId }) => {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const id = propId || paramId;
    const [loading, setLoading] = useState(true);
    const [supervision, setSupervision] = useState<TahfidzSupervision | null>(null);
    const [items, setItems] = useState<TahfidzSupervisionItem[]>([]);
    const [sending, setSending] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile) setUserRole(profile.role);
            }

            const [supervisionData, itemsData] = await Promise.all([
                fetchSupervisionById(id),
                fetchSupervisionItems(id)
            ]);

            setSupervision(supervisionData);
            setItems(itemsData);
        } catch (error) {
            console.error('Error loading supervision:', error);
            alert('Gagal memuat data supervisi');
            navigate('/tahfidz-supervision');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendToFoundation = async () => {
        if (!id || !supervision) return;

        if (!confirm('Kirim laporan supervisi ini ke yayasan?')) return;

        try {
            setSending(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Anda harus login');
                return;
            }

            await sendSupervisionToFoundation(id, user.id);
            alert('Laporan berhasil dikirim ke yayasan!');
            await loadData(); // Reload to show updated status
        } catch (error) {
            console.error('Error sending to foundation:', error);
            alert('Gagal mengirim laporan ke yayasan');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (!supervision) {
        return <div className="flex justify-center items-center h-64">Data tidak ditemukan</div>;
    }

    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
        if (!acc[item.category_number]) {
            acc[item.category_number] = [];
        }
        acc[item.category_number].push(item);
        return acc;
    }, {} as Record<number, TahfidzSupervisionItem[]>);

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header - Print Hidden */}
            <div className="print:hidden mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <Home size={18} />
                    Kembali ke Dashboard
                </button>

                <div className="flex gap-2">
                    {supervision.status === 'submitted' && !supervision.sent_to_foundation && userRole !== 'foundation' && (
                        <button
                            onClick={handleSendToFoundation}
                            disabled={sending}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                            {sending ? 'Mengirim...' : 'Kirim ke Yayasan'}
                        </button>
                    )}
                    {supervision.status === 'draft' && userRole !== 'foundation' && (
                        <button
                            onClick={() => navigate(`/tahfidz-supervision/edit/${id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Edit2 size={18} />
                            Edit
                        </button>
                    )}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        <Printer size={18} />
                        Print
                    </button>
                </div>
            </div>

            {/* Document Header */}
            <div className="bg-white rounded-lg shadow p-8 mb-6">
                <h1 className="text-3xl font-bold text-center mb-2">HASIL SUPERVISI GURU TAHFIDZ</h1>
                <p className="text-center text-gray-600 mb-6">{supervision.period} {supervision.year}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Nama Guru</label>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">{supervision.teacher_name}</p>
                            {supervision.institution && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border">
                                    {supervision.institution}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Tanggal Supervisi</label>
                        <p className="text-lg font-semibold">
                            {new Date(supervision.supervision_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Status Pengiriman ke Yayasan */}
                {supervision.sent_to_foundation && (
                    <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-green-700 font-semibold">✅ Terkirim ke Yayasan</span>
                            <span className="text-sm text-green-600">
                                pada {new Date(supervision.sent_to_foundation_at!).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Score Summary */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-sm text-gray-600">Total Skor</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {supervision.total_score}/{supervision.max_score}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600">Persentase</div>
                        <div className="text-2xl font-bold text-blue-600">{supervision.percentage}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600">Kategori</div>
                        <div className={`text-xl font-bold px-3 py-1 rounded-full inline-block ${getCategoryColor(supervision.category || '')}`}>
                            {supervision.category}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="text-xl font-bold text-gray-700">{supervision.status}</div>
                    </div>
                </div>

                {/* Promotion Recommendation */}
                <div className={`mt-4 p-4 rounded-lg border-2 ${getPromotionColor(supervision.category || '')}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-full bg-opacity-50">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium opacity-80">Rekomendasi Kenaikan Golongan</p>
                            <p className="text-xl font-bold">{getPromotionRecommendation(supervision.category || '')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Scores by Category */}
            <div className="bg-white rounded-lg shadow p-8 mb-6">
                <h2 className="text-2xl font-bold mb-6">Detail Penilaian</h2>

                {SUPERVISION_CATEGORIES.map(category => {
                    const categoryItems = itemsByCategory[category.number] || [];
                    const categoryScore = categoryItems.reduce((sum, item) => sum + item.score, 0);
                    const maxCategoryScore = category.indicators.length * 5;
                    const categoryPercentage = maxCategoryScore > 0 ? Math.round((categoryScore / maxCategoryScore) * 100) : 0;

                    return (
                        <div key={category.number} className="mb-6 border-b pb-6 last:border-b-0">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {category.number}. {category.name}
                                </h3>
                                <div className="text-sm font-medium text-blue-600">
                                    {categoryScore}/{maxCategoryScore} ({categoryPercentage}%)
                                </div>
                            </div>

                            <div className="space-y-3">
                                {category.indicators.map(indicator => {
                                    const item = categoryItems.find(i => i.indicator_number === indicator.number);

                                    return (
                                        <div key={indicator.number} className="pl-4 border-l-4 border-blue-500 py-2">
                                            <p className="font-medium text-gray-700 mb-2">
                                                {indicator.number}. {indicator.text}
                                            </p>
                                            {item ? (
                                                <>
                                                    <div className="flex items-center gap-4 mb-1">
                                                        <span className="text-sm font-semibold text-blue-600">
                                                            Skor: {item.score}/5
                                                        </span>
                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                            {getScoreLabel(item.score)}
                                                        </span>
                                                    </div>
                                                    {item.notes && (
                                                        <p className="text-sm text-gray-600 italic mt-1">
                                                            Catatan: {item.notes}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-400">Tidak dinilai</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Documentation Gallery */}
            {supervision.documentation_photos && supervision.documentation_photos.length > 0 && (
                <div className="bg-white rounded-lg shadow p-8 mb-6">
                    <h2 className="text-2xl font-bold mb-6">📸 Dokumentasi Supervisi</h2>
                    <SupervisionGallery
                        photos={supervision.documentation_photos}
                        onDelete={async (photoUrl) => {
                            if (!id) return;
                            // Delete from storage
                            await deleteSupervisionPhoto(photoUrl);
                            // Remove from database
                            await removePhotoFromSupervision(id, photoUrl);
                            // Reload data
                            await loadData();
                        }}
                        readOnly={supervision.status !== 'draft' || userRole === 'foundation'}
                    />
                </div>
            )}

            {/* Summary & Recommendations */}
            <div className="bg-white rounded-lg shadow p-8 mb-6">
                <h2 className="text-2xl font-bold mb-6">Ringkasan & Rekomendasi</h2>

                {supervision.strengths && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-green-700 mb-2">✅ Hal yang Sudah Baik</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{supervision.strengths}</p>
                    </div>
                )}

                {supervision.weaknesses && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-orange-700 mb-2">⚠️ Hal yang Perlu Diperbaiki</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{supervision.weaknesses}</p>
                    </div>
                )}

                {supervision.recommendations && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-blue-700 mb-2">💡 Rekomendasi</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{supervision.recommendations}</p>
                    </div>
                )}

                {supervision.action_plan && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-purple-700 mb-2">📋 Rencana Tindak Lanjut</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{supervision.action_plan}</p>
                    </div>
                )}

                {supervision.notes && (
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">📝 Catatan Tambahan</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{supervision.notes}</p>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .container, .container * {
            visibility: visible;
          }
          .container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default TahfidzSupervisionViewPage;
