import React, { useState } from 'react';
import { Upload, Download, Users, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../services/supabaseService';

interface Teacher {
  name: string;
}

const TeachersUploadPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const parsedTeachers: Teacher[] = jsonData.map((row) => ({
          name: row['Nama'] || row['Name'] || row['nama'] || ''
        })).filter(t => t.name.trim() !== '');

        setTeachers(parsedTeachers);
        setMessage({ type: 'success', text: `Berhasil membaca ${parsedTeachers.length} data guru` });
      } catch (error) {
        console.error('Error reading file:', error);
        setMessage({ type: 'error', text: 'Gagal membaca file Excel' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUploadToDatabase = async () => {
    if (teachers.length === 0) {
      setMessage({ type: 'error', text: 'Tidak ada data untuk diupload' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('teachers')
        .insert(teachers);

      if (error) throw error;

      setMessage({ type: 'success', text: `Berhasil upload ${teachers.length} guru ke database!` });
      setTeachers([]);
    } catch (error: any) {
      console.error('Error uploading:', error);
      setMessage({ type: 'error', text: `Gagal upload: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { Nama: 'Ustadz Ahmad' },
      { Nama: 'Ustadzah Dewi' },
      { Nama: 'Ustadz Budi' }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_guru_tahfidz.xlsx');
  };

  return (
    <div className="container mx-auto p-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Upload Data Guru Tahfidz</h1>
            <p className="text-sm text-gray-600">Import data guru dari file Excel</p>
          </div>
        </div>

        {/* Download Template */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Download className="text-blue-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Download Template Excel</h3>
              <p className="text-sm text-blue-700 mb-3">
                Download template Excel dengan format yang benar. Kolom: <strong>Nama</strong>
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Download size={18} />
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* Upload File */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Upload File Excel</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
              <Upload size={18} />
              Pilih File Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-600">Format: .xlsx atau .xls</span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
            ) : (
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Preview Data */}
        {teachers.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Preview Data ({teachers.length} guru)</h3>
              <button
                onClick={() => setTeachers([])}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
              >
                <Trash2 size={16} />
                Hapus Semua
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">No</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nama Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                        <td className="px-4 py-2 text-sm font-medium">{teacher.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUploadToDatabase}
                disabled={uploading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Upload size={20} />
                {uploading ? 'Mengupload...' : `Upload ${teachers.length} Guru ke Database`}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Petunjuk:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Download template Excel terlebih dahulu</li>
            <li>Isi kolom <strong>Nama</strong> dengan nama-nama guru tahfidz</li>
            <li>Upload file Excel yang sudah diisi</li>
            <li>Preview data akan muncul, periksa kembali</li>
            <li>Klik tombol "Upload ke Database" untuk menyimpan</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TeachersUploadPage;
