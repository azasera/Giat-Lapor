import React, { useState, useEffect } from 'react';
import { Calendar, Download, Plus, Edit2, Trash2, Save, Eye, X } from 'lucide-react';
import { supabase, fetchUserProfile } from '../services/supabaseService';

interface MonthlySchedule {
  month: string;
  teachers: string[];
}

interface AnnualSchedule {
  id?: string;
  year: string;
  institution_name: string;
  schedule_data: MonthlySchedule[];
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const TahfidzAnnualSchedulePage: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [institutionName, setInstitutionName] = useState('Mahad Tahfidul Quran');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [scheduleData, setScheduleData] = useState<MonthlySchedule[]>(
    MONTHS.map(month => ({ month, teachers: [] }))
  );
  const [savedSchedules, setSavedSchedules] = useState<AnnualSchedule[]>([]);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [viewingSchedule, setViewingSchedule] = useState<AnnualSchedule | null>(null);
  const [filterYear, setFilterYear] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);
      const profile = await fetchUserProfile(user.id);
      setCurrentUserRole(profile?.role || '');
      if (profile?.role !== 'principal' && profile?.role !== 'admin') {
        alert('Akses ditolak: halaman ini hanya untuk Kepala Sekolah atau Admin');
        window.location.href = '/';
        return;
      }

      // Load teachers from teachers table (not from profiles)
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .order('name', { ascending: true });

      if (!teachersError && teachersData) {
        setTeachers(teachersData);
      }

      // Load saved schedules
      const { data: schedules, error } = await supabase
        .from('tahfidz_annual_schedules')
        .select('*')
        .order('year', { ascending: false });

      if (!error && schedules) {
        setSavedSchedules(schedules);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = (monthIndex: number, teacherName: string) => {
    if (!teacherName.trim()) return;

    const newScheduleData = [...scheduleData];
    if (!newScheduleData[monthIndex].teachers.includes(teacherName)) {
      newScheduleData[monthIndex].teachers = [...newScheduleData[monthIndex].teachers, teacherName];
      setScheduleData(newScheduleData);
    }
  };

  const handleRemoveTeacher = (monthIndex: number, teacherIndex: number) => {
    const newScheduleData = [...scheduleData];
    const updatedTeachers = [...newScheduleData[monthIndex].teachers];
    updatedTeachers.splice(teacherIndex, 1);
    newScheduleData[monthIndex].teachers = updatedTeachers;
    setScheduleData(newScheduleData);
  };

  const handleAutoDistribute = () => {
    if (teachers.length === 0) {
      alert('Tidak ada guru yang tersedia');
      return;
    }

    const newScheduleData = MONTHS.map((month, index) => ({
      month,
      teachers: [] as string[]
    }));

    // Distribute teachers across months
    // Each teacher appears in 4 months (every 3 months)
    teachers.forEach((teacher, teacherIndex) => {
      const teacherName = teacher.name; // From teachers table
      // Start month for this teacher (spread evenly)
      const startMonth = teacherIndex % 3;

      // Add to 4 months (every 3 months)
      for (let i = 0; i < 4; i++) {
        const monthIndex = (startMonth + (i * 3)) % 12;
        newScheduleData[monthIndex].teachers = [...newScheduleData[monthIndex].teachers, teacherName];
      }
    });

    setScheduleData(newScheduleData);
    alert(`Berhasil mendistribusikan ${teachers.length} guru ke jadwal tahunan!`);
  };

  const handleSave = async () => {
    if (!institutionName.trim()) {
      alert('Mohon isi nama lembaga');
      return;
    }

    if (!selectedYear) {
      alert('Mohon pilih tahun');
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Anda harus login untuk menyimpan jadwal');
        setLoading(false);
        return;
      }

      const scheduleToSave: AnnualSchedule = {
        year: selectedYear,
        institution_name: institutionName,
        schedule_data: scheduleData,
        created_by: user.id
      };

      console.log('Saving schedule:', scheduleToSave);
      console.log('Current user:', user);

      if (editingScheduleId) {
        // Update existing
        const { created_by, ...updateData } = scheduleToSave;
        const { error } = await supabase
          .from('tahfidz_annual_schedules')
          .update(updateData)
          .eq('id', editingScheduleId);

        if (error) throw error;
        alert('Jadwal berhasil diperbarui!');
      } else {
        // Create new
        const { error } = await supabase
          .from('tahfidz_annual_schedules')
          .insert([scheduleToSave]);

        if (error) throw error;
        alert('Jadwal berhasil disimpan!');
      }

      await loadData();
      handleReset();
    } catch (error) {
      console.error('Error saving schedule:', error);
      const message = typeof error === 'object' && error && (error as any).message ? (error as any).message : '';
      if (message && message.includes('row-level security')) {
        alert('Gagal menyimpan: Anda tidak memiliki izin untuk menyimpan jadwal ini');
      } else {
        alert('Gagal menyimpan jadwal');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (schedule: AnnualSchedule) => {
    setEditingScheduleId(schedule.id || null);
    setInstitutionName(schedule.institution_name);
    setSelectedYear(schedule.year);
    setScheduleData(schedule.schedule_data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      const { error } = await supabase
        .from('tahfidz_annual_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadData();
      alert('Jadwal berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Gagal menghapus jadwal');
    }
  };

  const handleReset = () => {
    setEditingScheduleId(null);
    setInstitutionName('Mahad Tahfidul Quran');
    setSelectedYear(new Date().getFullYear().toString());
    setScheduleData(MONTHS.map(month => ({ month, teachers: [] })));
  };

  const handleExportPDF = () => {
    // Simple print functionality
    window.print();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📅 Jadwal Tahunan Supervisi</h1>
          <p className="text-sm text-gray-600 mt-1">Jadwal referensi bulanan seperti format tabel</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => window.location.href = '/tahfidz-supervision-schedule'}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md font-medium"
          >
            <Calendar size={20} />
            Jadwal Per Tanggal
          </button>
          <button
            onClick={handleAutoDistribute}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} />
            Auto Distribusi
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={20} />
            {editingScheduleId ? 'Update' : 'Simpan'}
          </button>
          {editingScheduleId && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Batal Edit
            </button>
          )}
        </div>
      </div>

      {/* Form Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lembaga</label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Contoh: Mahad Tahfidul Quran"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {[2024, 2025, 2026, 2027, 2028].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto mb-6 print:shadow-none">
        <div className="p-6 print:p-4">
          <h2 className="text-2xl font-bold text-center mb-6 print:text-xl">JADWAL SUPERVISI</h2>
          <div className="text-center mb-4">
            <div className="inline-block bg-yellow-300 px-6 py-2 font-bold">
              Lembaga: {institutionName}
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-gray-100">
                {MONTHS.map(month => (
                  <th key={month} className="border-2 border-black px-2 py-3 text-sm font-bold">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Calculate max rows needed */}
              {Array.from({ length: Math.max(...scheduleData.map(m => m.teachers.length), 1) }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {scheduleData.map((monthData, monthIndex) => (
                    <td key={monthIndex} className="border-2 border-black px-2 py-3 align-top">
                      {monthData.teachers[rowIndex] ? (
                        <div className="flex items-center justify-between gap-1 group">
                          <span className="text-sm flex-1">{monthData.teachers[rowIndex]}</span>
                          <button
                            onClick={() => handleRemoveTeacher(monthIndex, rowIndex)}
                            className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 print:hidden"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="print:hidden">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddTeacher(monthIndex, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="w-full text-xs border rounded px-1 py-1"
                          >
                            <option value="">+ Tambah</option>
                            {teachers.map(teacher => (
                              <option key={teacher.id} value={teacher.name}>
                                {teacher.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Schedules */}
      <div className="bg-white rounded-lg shadow p-6 print:hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📋 Jadwal Tersimpan</h2>

          {/* Filter Tahun */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">Semua Tahun</option>
              {Array.from(new Set(savedSchedules.map(s => s.year))).sort().reverse().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {savedSchedules.filter(s => filterYear === 'all' || s.year === filterYear).length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {filterYear === 'all' ? 'Belum ada jadwal tersimpan' : `Tidak ada jadwal untuk tahun ${filterYear}`}
          </p>
        ) : (
          <div className="grid gap-4">
            {savedSchedules.filter(s => filterYear === 'all' || s.year === filterYear).map(schedule => {
              // Hitung total guru terjadwal
              const totalTeachers = schedule.schedule_data.reduce((sum, month) => sum + month.teachers.length, 0);
              const monthsWithTeachers = schedule.schedule_data.filter(m => m.teachers.length > 0).length;

              return (
                <div key={schedule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{schedule.institution_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Tahun: {schedule.year}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dibuat: {new Date(schedule.created_at!).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>

                      {/* Preview Info */}
                      <div className="flex gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <Calendar size={16} />
                          <span>{monthsWithTeachers} bulan terjadwal</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600">
                          <span className="font-medium">{totalTeachers}</span>
                          <span>total supervisi</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingSchedule(schedule)}
                        className="flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                        <span className="text-sm font-medium">Lihat</span>
                      </button>
                      <button
                        onClick={() => handleLoad(schedule)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Jadwal"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Jadwal"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Detail Jadwal */}
      {viewingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Detail Jadwal Supervisi</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {viewingSchedule.institution_name} - Tahun {viewingSchedule.year}
                </p>
              </div>
              <button
                onClick={() => setViewingSchedule(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Schedule Table */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      {MONTHS.map(month => (
                        <th key={month} className="border-2 border-black px-2 py-3 text-sm font-bold">
                          {month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({
                      length: Math.max(...viewingSchedule.schedule_data.map(m => m.teachers.length), 1)
                    }).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {viewingSchedule.schedule_data.map((monthData, monthIndex) => (
                          <td key={monthIndex} className="border-2 border-black px-2 py-3 align-top">
                            {monthData.teachers[rowIndex] && (
                              <div className="text-sm">
                                {monthData.teachers[rowIndex]}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Ringkasan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Supervisi</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {viewingSchedule.schedule_data.reduce((sum, m) => sum + m.teachers.length, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bulan Terjadwal</p>
                    <p className="text-2xl font-bold text-green-600">
                      {viewingSchedule.schedule_data.filter(m => m.teachers.length > 0).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rata-rata per Bulan</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(viewingSchedule.schedule_data.reduce((sum, m) => sum + m.teachers.length, 0) / 12).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dibuat</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {new Date(viewingSchedule.created_at!).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => {
                    setViewingSchedule(null);
                    handleLoad(viewingSchedule);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit2 size={18} />
                  Edit Jadwal
                </button>
                <button
                  onClick={() => setViewingSchedule(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none, .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default TahfidzAnnualSchedulePage;
