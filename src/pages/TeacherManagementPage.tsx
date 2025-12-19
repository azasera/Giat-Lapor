import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Users, Trash2, Plus, Download, FileSpreadsheet, Edit2 } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast';
import * as XLSX from 'xlsx';

interface Teacher {
  id: string;
  name: string;
  institution?: string;
  created_at: string;
}

interface TeacherManagementPageProps {
  onUpload?: () => void;
}

const TeacherManagementPage: React.FC<TeacherManagementPageProps> = ({ onUpload }) => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherInstitution, setNewTeacherInstitution] = useState('SDITA');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editName, setEditName] = useState('');
  const [editInstitution, setEditInstitution] = useState('SDITA');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      showError('Gagal memuat daftar guru');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingToastId = showLoading('Mengupload file...');
    setUploading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Extract teacher names and institutions
          const teachersToInsert: { name: string, institution: string }[] = [];
          jsonData.forEach((row: any) => {
            const name = row['Nama Guru'] || row['nama_guru'] || row['Nama'] || row['nama'];
            const institution = row['Lembaga'] || row['lembaga'] || 'SDITA'; // Default to SDITA if missing

            if (name && typeof name === 'string' && name.trim()) {
              teachersToInsert.push({
                name: name.trim(),
                institution: institution.trim()
              });
            }
          });

          if (teachersToInsert.length === 0) {
            showError('Tidak ada data guru yang valid. Pastikan ada kolom "Nama Guru"');
            return;
          }

          // Insert to database
          const { error } = await supabase
            .from('teachers')
            .insert(teachersToInsert);

          if (error) throw error;

          showSuccess(`Berhasil mengupload ${teachersToInsert.length} guru!`);
          loadTeachers();
        } catch (error) {
          console.error('Error processing file:', error);
          showError('Gagal memproses file. Pastikan format Excel benar.');
        } finally {
          dismissToast(loadingToastId);
          setUploading(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Gagal mengupload file');
      dismissToast(loadingToastId);
      setUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim()) {
      showError('Nama guru tidak boleh kosong');
      return;
    }

    const loadingToastId = showLoading('Menambah guru...');
    try {
      const { error } = await supabase
        .from('teachers')
        .insert([{
          name: newTeacherName.trim(),
          institution: newTeacherInstitution
        }]);

      if (error) throw error;

      showSuccess('Guru berhasil ditambahkan!');
      setNewTeacherName('');
      loadTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);
      showError('Gagal menambah guru');
    } finally {
      dismissToast(loadingToastId);
    }
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus guru "${name}"?`)) return;

    const loadingToastId = showLoading('Menghapus guru...');
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showSuccess('Guru berhasil dihapus!');
      loadTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      showError('Gagal menghapus guru');
    } finally {
      dismissToast(loadingToastId);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditName(teacher.name);
    setEditInstitution(teacher.institution || 'SDITA');
  };

  const handleUpdateTeacher = async () => {
    if (!editingTeacher || !editName.trim()) {
      showError('Nama guru tidak boleh kosong');
      return;
    }

    const loadingToastId = showLoading('Mengupdate guru...');
    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          name: editName.trim(),
          institution: editInstitution
        })
        .eq('id', editingTeacher.id);

      if (error) throw error;

      await loadTeachers();
      showSuccess('Guru berhasil diupdate!');
      setEditingTeacher(null);
      setEditName('');
      setEditInstitution('SDITA');
    } catch (error) {
      console.error('Error updating teacher:', error);
      showError('Gagal mengupdate guru');
    } finally {
      dismissToast(loadingToastId);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { 'Nama Guru': 'Ustadz Ahmad', 'Lembaga': 'SDITA' },
      { 'Nama Guru': 'Ustadz Budi', 'Lembaga': 'SMPITA' },
      { 'Nama Guru': 'Ustadzah Candra', 'Lembaga': 'SMAITA' },
      { 'Nama Guru': 'Ustadz Dedi', 'Lembaga': 'MTA' },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Guru');
    XLSX.writeFile(wb, 'template_daftar_guru_v2.xlsx');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      {!onUpload && (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Dashboard
        </button>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">👥 Manajemen Guru</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola daftar guru untuk dijadwalkan supervisi</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload dari Excel
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload File Excel (.xlsx atau .csv)</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: Kolom "Nama Guru" dan "Lembaga" (Opsional, default SDITA)
            </p>
          </div>

          <div className="flex items-end">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download Template Excel
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Format Excel:
          </h3>
          <div className="text-sm text-blue-800">
            <p className="mb-1">Buat file Excel dengan kolom:</p>
            <div className="bg-white rounded p-2 font-mono text-xs">
              | Nama Guru | Lembaga |<br />
              |-----------|---------|<br />
              | Ustadz Ahmad | SDITA |<br />
              | Ustadz Budi | SMPITA |<br />
              | Ustadzah Candra | SMAITA |<br />
              | Ustadz Dedi | MTA |
            </div>
          </div>
        </div>
      </div>

      {/* Manual Add Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tambah Manual
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTeacherName}
            onChange={(e) => setNewTeacherName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTeacher()}
            placeholder="Nama guru (contoh: Ustadz Ahmad)"
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <select
            value={newTeacherInstitution}
            onChange={(e) => setNewTeacherInstitution(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="SDITA">SDITA</option>
            <option value="SMPITA">SMPITA</option>
            <option value="SMAITA">SMAITA</option>
            <option value="MTA">MTA</option>
          </select>
          <button
            onClick={handleAddTeacher}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Daftar Guru ({teachers.length})
        </h2>

        {teachers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Belum ada guru. Upload dari Excel atau tambah manual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {teacher.institution || 'SDITA'}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(teacher.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTeacher(teacher)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Edit guru"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Hapus guru"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Guru</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Guru</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Nama guru..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lembaga</label>
                <select
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="SDITA">SDITA</option>
                  <option value="SMPITA">SMPITA</option>
                  <option value="SMAITA">SMAITA</option>
                  <option value="MTA">MTA</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setEditingTeacher(null);
                  setEditName('');
                  setEditInstitution('SDITA');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateTeacher}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagementPage;
