import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { TahfidzSupervisionSchedule } from '../types/tahfidzSupervision';
import {
  fetchSupervisionSchedules,
  createSupervisionSchedule,
  updateSupervisionSchedule,
  deleteSupervisionSchedule,
  fetchTeachersList,
  fetchSupervisions
} from '../services/tahfidzSupervisionService';
import { supabase } from '../services/supabaseService';
import { recommendFocusAreas, generateFocusNotes } from '../services/aiService';

const TahfidzSupervisionSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<TahfidzSupervisionSchedule[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TahfidzSupervisionSchedule | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [filterInstitution, setFilterInstitution] = useState<string>('');

  const [formData, setFormData] = useState<{
    teacher_id: string;
    teacher_name: string;
    scheduled_date: string;
    scheduled_time: string;
    focus_areas: string[];
    notes: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  }>({
    teacher_id: '',
    teacher_name: '',
    scheduled_date: '',
    scheduled_time: '',
    focus_areas: [],
    notes: '',
    status: 'scheduled'
  });

  const [bulkFormData, setBulkFormData] = useState({
    start_date: '',
    interval_days: 7, // Default: 1 minggu
    start_time: '08:00',
    focus_areas: [] as string[],
    notes: '',
    use_ai_focus: false
  });

  const [aiRecommendation, setAiRecommendation] = useState<{
    focusAreas: string[];
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
  } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);
      const [schedulesData, teachersData] = await Promise.all([
        fetchSupervisionSchedules(user.id),
        fetchTeachersList()
      ]);

      setSchedules(schedulesData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const scheduleData = {
        ...formData,
        supervisor_id: currentUserId,
        focus_areas: formData.focus_areas.filter(a => a.trim())
      };

      if (editingSchedule) {
        await updateSupervisionSchedule(editingSchedule.id, scheduleData);
      } else {
        await createSupervisionSchedule(scheduleData);
      }

      await loadData();
      resetForm();
      alert('Jadwal berhasil disimpan!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Gagal menyimpan jadwal');
    }
  };

  const handleEdit = (schedule: TahfidzSupervisionSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      teacher_id: schedule.teacher_id || '',
      teacher_name: schedule.teacher_name,
      scheduled_date: schedule.scheduled_date,
      scheduled_time: schedule.scheduled_time || '',
      focus_areas: schedule.focus_areas || [],
      notes: schedule.notes || '',
      status: schedule.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      await deleteSupervisionSchedule(id);
      await loadData();
      alert('Jadwal berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Gagal menghapus jadwal');
    }
  };

  const resetForm = () => {
    setFormData({
      teacher_id: '',
      teacher_name: '',
      scheduled_date: '',
      scheduled_time: '',
      focus_areas: [],
      notes: '',
      status: 'scheduled'
    });
    setEditingSchedule(null);
    setShowForm(false);
  };

  const handleBulkSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bulkFormData.start_date) {
      alert('Mohon pilih tanggal mulai');
      return;
    }

    if (teachers.length === 0) {
      alert('Tidak ada guru yang tersedia');
      return;
    }

    try {
      setLoading(true);
      const startDate = new Date(bulkFormData.start_date);
      const schedulesToCreate = [];

      // Create schedule for each teacher with interval
      for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[i];
        const scheduleDate = new Date(startDate);
        scheduleDate.setDate(scheduleDate.getDate() + (i * bulkFormData.interval_days));

        const scheduleData = {
          teacher_id: teacher.id,
          teacher_name: teacher.name,
          scheduled_date: scheduleDate.toISOString().split('T')[0],
          scheduled_time: bulkFormData.start_time,
          focus_areas: bulkFormData.focus_areas.filter(a => a.trim()),
          notes: bulkFormData.notes,
          status: 'scheduled' as const,
          supervisor_id: currentUserId
        };

        schedulesToCreate.push(scheduleData);
      }

      // Create all schedules
      for (const schedule of schedulesToCreate) {
        await createSupervisionSchedule(schedule);
      }

      await loadData();
      setShowBulkForm(false);
      setBulkFormData({
        start_date: '',
        interval_days: 7,
        start_time: '08:00',
        focus_areas: [],
        notes: '',
        use_ai_focus: false
      });
      alert(`Berhasil membuat ${schedulesToCreate.length} jadwal untuk semua guru!`);
    } catch (error) {
      console.error('Error creating bulk schedules:', error);
      alert('Gagal membuat jadwal otomatis');
    } finally {
      setLoading(false);
    }
  };

  const handleAIRecommendFocus = async () => {
    try {
      setLoadingAI(true);

      // Fetch all previous supervisions
      const allSupervisions = await fetchSupervisions(currentUserId, 'principal');

      // Get recommendation
      const recommendation = recommendFocusAreas(allSupervisions);
      setAiRecommendation(recommendation);

      // Auto-fill focus areas
      setBulkFormData({
        ...bulkFormData,
        focus_areas: recommendation.focusAreas,
        use_ai_focus: true
      });

    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      alert('Gagal mendapatkan rekomendasi AI');
    } finally {
      setLoadingAI(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back to Dashboard Button */}
      <button
        onClick={() => window.location.href = '/'}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Dashboard
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📅 Jadwal Supervisi Per Tanggal</h1>
          <p className="text-sm text-gray-600 mt-1">Jadwal detail dengan tanggal dan waktu spesifik</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => window.location.href = '/tahfidz-annual-schedule'}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-md font-medium"
          >
            <Calendar size={20} />
            Jadwal Tahunan
          </button>
          <button
            onClick={() => setShowBulkForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-md font-medium"
          >
            <Calendar size={20} />
            Jadwal Otomatis
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Buat Manual
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingSchedule ? 'Edit Jadwal' : 'Buat Jadwal Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Guru Tahfidz</label>
                <div className="space-y-2">
                  <select
                    value={filterInstitution}
                    onChange={(e) => setFilterInstitution(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                  >
                    <option value="">Semua Lembaga</option>
                    <option value="SDITA">SDITA</option>
                    <option value="SMPITA">SMPITA</option>
                    <option value="SMAITA">SMAITA</option>
                    <option value="MTA">MTA</option>
                  </select>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => {
                      const teacher = teachers.find(t => t.id === e.target.value);
                      setFormData({
                        ...formData,
                        teacher_id: e.target.value,
                        teacher_name: teacher?.name || ''
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Pilih Guru</option>
                    {teachers
                      .filter(t => !filterInstitution || t.institution === filterInstitution)
                      .map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} {teacher.institution ? `(${teacher.institution})` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Waktu</label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="scheduled">Terjadwal</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                  <option value="rescheduled">Dijadwal Ulang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Schedule Form Modal */}
      {showBulkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">🚀 Buat Jadwal Otomatis untuk Semua Guru</h2>
            <p className="text-gray-600 mb-4">
              Sistem akan membuat jadwal untuk {teachers.length} guru secara otomatis dengan interval yang Anda tentukan.
            </p>

            <form onSubmit={handleBulkSchedule} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Preview Jadwal</h3>
                <p className="text-sm text-blue-800">
                  {teachers.length} guru akan dijadwalkan mulai dari tanggal yang Anda pilih,
                  dengan interval {bulkFormData.interval_days} hari antar guru.
                </p>
                {bulkFormData.start_date && (
                  <p className="text-sm text-blue-800 mt-2">
                    Jadwal terakhir: {new Date(new Date(bulkFormData.start_date).getTime() + ((teachers.length - 1) * bulkFormData.interval_days * 24 * 60 * 60 * 1000)).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Mulai *</label>
                <input
                  type="date"
                  value={bulkFormData.start_date}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, start_date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Guru pertama akan dijadwalkan pada tanggal ini</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Interval Antar Guru *</label>
                <select
                  value={bulkFormData.interval_days}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, interval_days: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="1">Setiap Hari (1 hari)</option>
                  <option value="2">Setiap 2 Hari</option>
                  <option value="3">Setiap 3 Hari</option>
                  <option value="7">Setiap Minggu (7 hari)</option>
                  <option value="14">Setiap 2 Minggu (14 hari)</option>
                  <option value="30">Setiap Bulan (30 hari)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Jarak waktu antara supervisi satu guru dengan guru berikutnya</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Waktu Supervisi *</label>
                <input
                  type="time"
                  value={bulkFormData.start_time}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, start_time: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Area Fokus (Opsional)</label>
                  <button
                    type="button"
                    onClick={handleAIRecommendFocus}
                    disabled={loadingAI}
                    className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    {loadingAI ? 'Analyzing...' : 'AI Recommend'}
                  </button>
                </div>

                {aiRecommendation && (
                  <div className={`mb-3 p-3 rounded-lg border-2 ${aiRecommendation.priority === 'high' ? 'bg-red-50 border-red-300' :
                    aiRecommendation.priority === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-green-50 border-green-300'
                    }`}>
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles size={16} className={
                        aiRecommendation.priority === 'high' ? 'text-red-600' :
                          aiRecommendation.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                      } />
                      <div className="flex-1">
                        <p className={`text-xs font-semibold mb-1 ${aiRecommendation.priority === 'high' ? 'text-red-800' :
                          aiRecommendation.priority === 'medium' ? 'text-yellow-800' :
                            'text-green-800'
                          }`}>
                          AI Recommendation - Priority: {aiRecommendation.priority.toUpperCase()}
                        </p>
                        <p className={`text-xs ${aiRecommendation.priority === 'high' ? 'text-red-700' :
                          aiRecommendation.priority === 'medium' ? 'text-yellow-700' :
                            'text-green-700'
                          }`}>
                          {aiRecommendation.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {[0, 1, 2].map(index => (
                  <input
                    key={index}
                    type="text"
                    value={bulkFormData.focus_areas[index] || ''}
                    onChange={(e) => {
                      const newAreas = [...bulkFormData.focus_areas];
                      newAreas[index] = e.target.value;
                      setBulkFormData({ ...bulkFormData, focus_areas: newAreas, use_ai_focus: false });
                    }}
                    placeholder={`Area fokus ${index + 1}`}
                    className="w-full border rounded-lg px-3 py-2 mb-2"
                  />
                ))}
                <p className="text-xs text-gray-500 mt-1">
                  💡 Klik "AI Recommend" untuk mendapatkan rekomendasi area fokus berdasarkan data supervisi sebelumnya
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catatan (Opsional)</label>
                <textarea
                  value={bulkFormData.notes}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Catatan umum untuk semua jadwal..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkForm(false);
                    setAiRecommendation(null);
                    setBulkFormData({
                      start_date: '',
                      interval_days: 7,
                      start_time: '08:00',
                      focus_areas: [],
                      notes: '',
                      use_ai_focus: false
                    });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium disabled:opacity-50"
                >
                  {loading ? 'Membuat Jadwal...' : `Buat ${teachers.length} Jadwal`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {schedules.map(schedule => (
          <div key={schedule.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{schedule.teacher_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(schedule.status)}`}>
                    {schedule.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-gray-600 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(schedule.scheduled_date).toLocaleDateString('id-ID')}</span>
                  </div>
                  {schedule.scheduled_time && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{schedule.scheduled_time}</span>
                    </div>
                  )}
                </div>

                {schedule.notes && (
                  <p className="text-gray-600 text-sm">{schedule.notes}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(schedule)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {schedules.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Belum ada jadwal supervisi. Klik "Buat Manual" atau "Jadwal Otomatis" untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  );
};

export default TahfidzSupervisionSchedulePage;
