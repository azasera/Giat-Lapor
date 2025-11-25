import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Send, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FoundationTahfidzReport, TahfidzSupervision, getCategoryColor, getPromotionRecommendation, getPromotionColor } from '../types/tahfidzSupervision';
import {
  fetchFoundationReports,
  generateFoundationReport,
  createFoundationReport,
  updateFoundationReport,
  deleteFoundationReport,
  fetchFoundationSupervisionReports
} from '../services/tahfidzSupervisionService';
import { supabase } from '../services/supabaseService';
import { getStatusColor } from '../types/tahfidzSupervision';

type TabType = 'aggregate' | 'individual';

const FoundationTahfidzReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('aggregate');
  const [reports, setReports] = useState<FoundationTahfidzReport[]>([]);
  const [supervisions, setSupervisions] = useState<TahfidzSupervision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedReport, setSelectedReport] = useState<FoundationTahfidzReport | null>(null);

  // Filters for Individual Reports
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');

  // Filters for Aggregate Reports
  const [filterAggregateInstitution, setFilterAggregateInstitution] = useState('');

  const [formData, setFormData] = useState({
    period: '',
    year: new Date().getFullYear().toString(),
    report_type: 'monthly' as 'monthly' | 'semester' | 'annual',
    institution: 'SDITA',
    recommendations: '',
    action_plan: '',
    strengths: '',
    weaknesses: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      // Fetch role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }

      const [aggregateData, supervisionData] = await Promise.all([
        fetchFoundationReports(),
        fetchFoundationSupervisionReports()
      ]);
      setReports(aggregateData);
      setSupervisions(supervisionData);
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const generatedData = await generateFoundationReport(
        formData.period,
        formData.year,
        formData.report_type,
        formData.institution
      );

      const reportData = {
        ...generatedData,
        recommendations: formData.recommendations,
        action_plan: formData.action_plan,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        submitted_by: currentUserId,
        institution: formData.institution,
        status: 'draft' as const
      };

      await createFoundationReport(reportData);
      await loadData();
      setShowForm(false);
      resetForm();
      alert('Laporan berhasil dibuat!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Gagal membuat laporan: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!confirm('Yakin ingin mengirim laporan ini ke Yayasan? Laporan tidak dapat diubah setelah dikirim.')) return;

    try {
      await updateFoundationReport(id, { status: 'submitted' });
      await loadData();
      alert('Laporan berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Gagal mengirim laporan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;

    try {
      await deleteFoundationReport(id);
      await loadData();
      alert('Laporan berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Gagal menghapus laporan');
    }
  };

  const exportToPDF = (report: FoundationTahfidzReport) => {
    // Implement PDF export logic here
    alert('Fitur export PDF akan segera hadir');
  };

  const resetForm = () => {
    setFormData({
      period: '',
      year: new Date().getFullYear().toString(),
      report_type: 'monthly',
      institution: 'SDITA',
      recommendations: '',
      action_plan: '',
      strengths: '',
      weaknesses: ''
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back to Dashboard Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Dashboard
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📑 Laporan Yayasan</h1>
          <p className="text-gray-600 mt-1">Rekapitulasi dan laporan supervisi untuk Yayasan</p>
        </div>
        {userRole === 'principal' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Buat Laporan Rekapitulasi
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('aggregate')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'aggregate'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Laporan Rekapitulasi
        </button>
        <button
          onClick={() => setActiveTab('individual')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'individual'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Laporan Individu
        </button>
      </div>

      {/* Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Buat Laporan Rekapitulasi</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Periode</label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="Contoh: Januari"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tahun</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipe Laporan</label>
                <select
                  value={formData.report_type}
                  onChange={(e) => setFormData({ ...formData, report_type: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="monthly">Bulanan</option>
                  <option value="semester">Semester</option>
                  <option value="annual">Tahunan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lembaga</label>
                <select
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="SDITA">SDITA</option>
                  <option value="SMPITA">SMPITA</option>
                  <option value="SMAITA">SMAITA</option>
                  <option value="MTA">MTA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kekuatan Institusi</label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Hal-hal yang sudah baik..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Area Perbaikan</label>
                <textarea
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Hal-hal yang perlu ditingkatkan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rekomendasi</label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Rekomendasi untuk perbaikan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rencana Tindak Lanjut</label>
                <textarea
                  value={formData.action_plan}
                  onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Langkah konkret selanjutnya..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate & Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Detail Laporan</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Periode</div>
                  <div className="font-semibold">{selectedReport.period} {selectedReport.year}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tipe</div>
                  <div className="font-semibold">{selectedReport.report_type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Guru</div>
                  <div className="font-semibold text-2xl text-blue-600">{selectedReport.total_teachers}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Rata-rata Skor</div>
                  <div className="font-semibold text-2xl text-green-600">{selectedReport.average_score.toFixed(2)}%</div>
                </div>
                {selectedReport.institution && (
                  <div>
                    <div className="text-sm text-gray-600">Lembaga</div>
                    <div className="font-semibold">{selectedReport.institution}</div>
                  </div>
                )}
              </div>

              {selectedReport.summary_data && (
                <>
                  <div>
                    <h3 className="font-bold mb-2">Distribusi Hasil</h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="bg-green-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedReport.summary_data.distribution.mumtaz}
                        </div>
                        <div className="text-xs text-gray-600">Mumtaz</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedReport.summary_data.distribution.jayyid_jiddan}
                        </div>
                        <div className="text-xs text-gray-600">Jayyid Jiddan</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedReport.summary_data.distribution.jayyid}
                        </div>
                        <div className="text-xs text-gray-600">Jayyid</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedReport.summary_data.distribution.maqbul}
                        </div>
                        <div className="text-xs text-gray-600">Maqbul</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedReport.summary_data.distribution.dhaif}
                        </div>
                        <div className="text-xs text-gray-600">Dha'if</div>
                      </div>
                    </div>
                  </div>

                  {selectedReport.summary_data.top_performers && selectedReport.summary_data.top_performers.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-2">Top Performers</h3>
                      <div className="space-y-2">
                        {selectedReport.summary_data.top_performers.map((performer, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-green-50 p-3 rounded">
                            <span className="font-medium">{performer.teacher_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-bold">{performer.score.toFixed(2)}%</span>
                              <span className="text-sm text-gray-600">({performer.category})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedReport.strengths && (
                <div>
                  <h3 className="font-bold mb-2">Kekuatan Institusi</h3>
                  <p className="text-gray-700">{selectedReport.strengths}</p>
                </div>
              )}

              {selectedReport.weaknesses && (
                <div>
                  <h3 className="font-bold mb-2">Area Perbaikan</h3>
                  <p className="text-gray-700">{selectedReport.weaknesses}</p>
                </div>
              )}

              {selectedReport.recommendations && (
                <div>
                  <h3 className="font-bold mb-2">Rekomendasi</h3>
                  <p className="text-gray-700">{selectedReport.recommendations}</p>
                </div>
              )}

              {selectedReport.action_plan && (
                <div>
                  <h3 className="font-bold mb-2">Rencana Tindak Lanjut</h3>
                  <p className="text-gray-700">{selectedReport.action_plan}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Reports Tab */}
      {activeTab === 'aggregate' && (
        <div className="grid gap-4">
          {/* Filter for Aggregate Reports */}
          <div className="flex gap-4 mb-4">
            <select
              value={filterAggregateInstitution}
              onChange={(e) => setFilterAggregateInstitution(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Semua Lembaga</option>
              <option value="SDITA">SDITA</option>
              <option value="SMPITA">SMPITA</option>
              <option value="SMAITA">SMAITA</option>
              <option value="MTA">MTA</option>
            </select>
          </div>

          {reports
            .filter(r => !filterAggregateInstitution || r.institution === filterAggregateInstitution)
            .map(report => (
              <div key={report.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        Laporan {report.period} {report.year}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      {report.institution && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border">
                          {report.institution}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div>
                        <div className="text-sm text-gray-600">Total Guru</div>
                        <div className="text-lg font-semibold text-blue-600">{report.total_teachers}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Rata-rata Skor</div>
                        <div className="text-lg font-semibold text-green-600">{report.average_score.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Tipe</div>
                        <div className="text-lg font-semibold">{report.report_type}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => exportToPDF(report)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    {report.status === 'draft' && (
                      <button
                        onClick={() => handleSubmit(report.id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                        title="Kirim ke Yayasan"
                      >
                        <Send size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {reports.filter(r => !filterAggregateInstitution || r.institution === filterAggregateInstitution).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Belum ada laporan rekapitulasi. Klik "Buat Laporan Rekapitulasi" untuk menambahkan.
            </div>
          )}
        </div>
      )}

      {/* Individual Supervision Reports Tab */}
      {activeTab === 'individual' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                <input
                  type="text"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  placeholder="Semua Periode"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tahun</label>
                <input
                  type="text"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  placeholder="Semua Tahun"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Semua Kategori</option>
                  <option value="Mumtaz">Mumtaz</option>
                  <option value="Jayyid Jiddan">Jayyid Jiddan</option>
                  <option value="Jayyid">Jayyid</option>
                  <option value="Maqbul">Maqbul</option>
                  <option value="Dha'if">Dha'if</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supervisions List */}
          <div className="grid gap-4">
            {supervisions
              .filter(s => {
                if (filterPeriod && !s.period.toLowerCase().includes(filterPeriod.toLowerCase())) return false;
                if (filterYear && s.year !== filterYear) return false;
                if (filterCategory && s.category !== filterCategory) return false;
                if (filterInstitution && s.institution !== filterInstitution) return false;
                return true;
              })
              .map(supervision => (
                <div key={supervision.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{supervision.teacher_name}</h3>
                        {supervision.category && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(supervision.category)}`}>
                            {supervision.category}
                          </span>
                        )}
                        {supervision.category && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPromotionColor(supervision.category)}`}>
                            {getPromotionRecommendation(supervision.category)}
                          </span>
                        )}
                        {supervision.institution && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                            {supervision.institution}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-2">
                        <div>
                          <div className="text-sm text-gray-600">Periode</div>
                          <div className="font-semibold">{supervision.period} {supervision.year}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Tanggal</div>
                          <div className="font-semibold">
                            {new Date(supervision.supervision_date).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Skor</div>
                          <div className="text-lg font-semibold text-blue-600">{supervision.percentage}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Dikirim</div>
                          <div className="text-sm">
                            {new Date(supervision.sent_to_foundation_at!).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>

                      {supervision.strengths && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          <span className="font-medium">Kekuatan:</span> {supervision.strengths}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/tahfidz-supervision/view/${supervision.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {supervisions.filter(s => {
              if (filterPeriod && !s.period.toLowerCase().includes(filterPeriod.toLowerCase())) return false;
              if (filterYear && s.year !== filterYear) return false;
              if (filterCategory && s.category !== filterCategory) return false;
              if (filterInstitution && s.institution !== filterInstitution) return false;
              return true;
            }).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Belum ada laporan supervisi individual yang dikirim.
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoundationTahfidzReportPage;
