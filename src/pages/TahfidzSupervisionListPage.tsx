import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Award, Calendar, FileText } from 'lucide-react';
import { TahfidzSupervision } from '../types/tahfidzSupervision';
import { fetchSupervisions, deleteSupervision, generateCertificate } from '../services/tahfidzSupervisionService';
import { supabase } from '../services/supabaseService';
import { getCategoryColor, getStatusColor } from '../types/tahfidzSupervision';

interface TahfidzSupervisionListPageProps {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCreate?: () => void;
}

const TahfidzSupervisionListPage: React.FC<TahfidzSupervisionListPageProps> = ({ onView, onEdit, onCreate }) => {
  const navigate = useNavigate();
  const [supervisions, setSupervisions] = useState<TahfidzSupervision[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role || '';
      setUserRole(role);

      const data = await fetchSupervisions(user.id, role);
      setSupervisions(data);
    } catch (error) {
      console.error('Error loading supervisions:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus supervisi ini?')) return;

    try {
      await deleteSupervision(id);
      await loadData();
      alert('Supervisi berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting supervision:', error);
      alert('Gagal menghapus supervisi');
    }
  };

  const handleGenerateCertificate = async (id: string) => {
    try {
      await generateCertificate(id);
      alert('Sertifikat berhasil dibuat!');
      navigate('/tahfidz-certificates');
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      alert(error.message || 'Gagal membuat sertifikat');
    }
  };

  const filteredSupervisions = supervisions.filter(s => {
    if (filterPeriod && s.period !== filterPeriod) return false;
    if (filterYear && s.year !== filterYear) return false;
    if (filterCategory && s.category !== filterCategory) return false;
    if (filterInstitution && s.institution !== filterInstitution) return false;
    return true;
  });

  const periods = [...new Set(supervisions.map(s => s.period))];
  const years = [...new Set(supervisions.map(s => s.year))];
  const categories = ['Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul', "Dha'if"];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6">
      {/* Back to Dashboard Button - Mobile Optimized */}
      {!onView && (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3 sm:mb-4 font-medium active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm sm:text-base">Kembali ke Dashboard</span>
        </button>
      )}

      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">📊 Supervisi Guru Tahfidz</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {(userRole === 'principal' || userRole === 'admin') && (
            <>
              <button
                onClick={() => navigate('/tahfidz-supervision-schedule')}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 active:scale-95 transition-all text-sm flex-1 sm:flex-none"
              >
                <Calendar size={18} />
                <span className="hidden sm:inline">Jadwal</span>
              </button>
              <button
                onClick={() => onCreate ? onCreate() : navigate('/tahfidz-supervision/new')}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm flex-1 sm:flex-none"
              >
                <Plus size={18} />
                <span>Buat</span>
              </button>
            </>
          )}
          {(userRole === 'principal' || userRole === 'admin') && (
            <button
              onClick={() => navigate('/tahfidz-foundation-reports')}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 active:scale-95 transition-all text-sm flex-1 sm:flex-none"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">Laporan</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Lembaga</label>
            <select
              value={filterInstitution}
              onChange={(e) => setFilterInstitution(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Semua Lembaga</option>
              <option value="SDITA">SDITA</option>
              <option value="SMPITA">SMPITA</option>
              <option value="SMAITA">SMAITA</option>
              <option value="MTA">MTA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Periode</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Semua Periode</option>
              {periods.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Semua Tahun</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Supervisi</div>
          <div className="text-2xl font-bold text-blue-600">{filteredSupervisions.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Rata-rata Skor</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredSupervisions.length > 0
              ? Math.round(filteredSupervisions.reduce((sum, s) => sum + s.percentage, 0) / filteredSupervisions.length)
              : 0}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Mumtaz</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredSupervisions.filter(s => s.category === 'Mumtaz').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Perlu Pembinaan</div>
          <div className="text-2xl font-bold text-red-600">
            {filteredSupervisions.filter(s => s.percentage < 70).length}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-3 sm:gap-4">
        {filteredSupervisions.map(supervision => (
          <div key={supervision.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex-1 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <h3 className="text-lg sm:text-xl font-semibold">{supervision.teacher_name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${getStatusColor(supervision.status)}`}>
                      {supervision.status}
                    </span>
                    {supervision.category && (
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getCategoryColor(supervision.category)}`}>
                        {supervision.category}
                      </span>
                    )}
                    {supervision.institution && (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-700">
                        {supervision.institution}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                  <span>{supervision.period} {supervision.year}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{new Date(supervision.supervision_date).toLocaleDateString('id-ID')}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-semibold text-blue-600 text-sm sm:text-base">{supervision.percentage}%</span>
                </div>

                {/* Summary */}
                {supervision.strengths && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-2">
                    <span className="font-medium">Kekuatan:</span> {supervision.strengths}
                  </p>
                )}
                {supervision.weaknesses && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    <span className="font-medium">Perlu Perbaikan:</span> {supervision.weaknesses}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onView ? onView(supervision.id) : navigate(`/tahfidz-supervision/view/${supervision.id}`)}
                  className="flex-1 sm:flex-none p-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded transition-colors"
                  title="Lihat Detail"
                >
                  <Eye size={18} className="mx-auto" />
                </button>
                {userRole !== 'foundation' && (
                  <button
                    onClick={() => onEdit ? onEdit(supervision.id) : navigate(`/tahfidz-supervision/edit/${supervision.id}`)}
                    className="flex-1 sm:flex-none p-2 text-green-600 hover:bg-green-50 active:bg-green-100 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} className="mx-auto" />
                  </button>
                )}
                {(userRole !== 'foundation' && (supervision.category === 'Mumtaz' || supervision.category === 'Jayyid Jiddan')) && (
                  <button
                    onClick={() => handleGenerateCertificate(supervision.id)}
                    className="flex-1 sm:flex-none p-2 text-yellow-600 hover:bg-yellow-50 active:bg-yellow-100 rounded transition-colors"
                    title="Generate Sertifikat"
                  >
                    <Award size={18} className="mx-auto" />
                  </button>
                )}
                {(userRole === 'admin' || (userRole !== 'foundation' && supervision.status === 'draft')) && (
                  <button
                    onClick={() => handleDelete(supervision.id)}
                    className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={18} className="mx-auto" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredSupervisions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Belum ada data supervisi. Klik "Buat Supervisi" untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  );
};

export default TahfidzSupervisionListPage;
