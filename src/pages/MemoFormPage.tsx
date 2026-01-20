import React, { useState, useEffect, useRef } from 'react';
import { Save, ChevronLeft, Plus, Trash2, Download, FileText, Settings, X, GripVertical, Upload, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { MemoData, MemoTable } from '../types/memo';
import { saveMemoToSupabase, supabase, uploadMemoImage } from '../services/supabaseService';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MemoFormPageProps {
    memoId?: string;
    onSaved: () => void;
    onCancel: () => void;
    userRole?: 'principal' | 'foundation' | 'admin';
}

const MemoFormPage: React.FC<MemoFormPageProps> = ({ memoId, onSaved, onCancel, userRole = 'principal' }) => {
    const [formData, setFormData] = useState<MemoData>({
        id: '',
        user_id: '',
        memo_number: '',
        document_title: 'MEMO INTERNAL',
        subject: '',
        from: '',
        to: '',
        show_from_to: true,
        date: new Date().toISOString().split('T')[0],
        tables: [],
        opening: '',
        description: '',
        signatory_name: '',
        signatory_role: 'Kepala MTA At-Tauhid',
        status: 'draft'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showFromTo, setShowFromTo] = useState(true); // Toggle untuk menampilkan section Dari-Kepada
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        logos: true,
        mainInfo: true,
        tables: true,
        closing: true
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        if (memoId) {
            loadMemo();
        }
        // Don't add default table - let user add tables if needed
    }, [memoId]);

    const loadMemo = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('memos')
                .select('*, memo_tables(*)')
                .eq('id', memoId)
                .single();

            if (error) throw error;

            setFormData({
                id: data.id,
                user_id: data.user_id,
                memo_number: data.memo_number,
                document_title: data.document_title || 'MEMO INTERNAL',
                subject: data.subject,
                from: data.from,
                to: data.to,
                show_from_to: data.show_from_to !== false, // Default true if not set
                date: data.memo_date,
                opening: data.opening,
                description: data.description,
                signatory_name: data.signatory_name,
                signatory_role: data.signatory_role,
                logo_left_url: data.logo_left_url,
                logo_right_url: data.logo_right_url,
                signature_url: data.signature_url,
                stamp_url: data.stamp_url,
                status: data.status,
                tables: (data.memo_tables || []).sort((a: any, b: any) => a.order_index - b.order_index).map((table: any) => ({
                    id: table.id,
                    title: table.title,
                    headers: table.headers || ['No', 'Nama', 'Jabatan', 'Honor'],
                    rows: table.rows || [['1', '', '', '']]
                }))
            });
            setShowFromTo(data.show_from_to !== false);
        } catch (error) {
            console.error('Error loading memo:', error);
            showError('Gagal memuat data memo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTable = () => {
        const newTable: MemoTable = {
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: '',
            headers: ['Nama Guru', 'Jam Tambahan'],
            rows: [['', '']]
        };
        setFormData(prev => ({
            ...prev,
            tables: [...prev.tables, newTable]
        }));
    };

    const handleRemoveTable = (id: string) => {
        setFormData(prev => ({
            ...prev,
            tables: prev.tables.filter(t => t.id !== id)
        }));
    };

    const handleTableChange = (id: string, field: keyof MemoTable, value: any) => {
        setFormData(prev => ({
            ...prev,
            tables: prev.tables.map(t => t.id === id ? { ...t, [field]: value } : t)
        }));
    };

    const handleAddRow = (tableId: string) => {
        setFormData(prev => ({
            ...prev,
            tables: prev.tables.map(t => {
                if (t.id === tableId) {
                    const newRow = new Array(t.headers.length).fill('');
                    return { ...t, rows: [...t.rows, newRow] };
                }
                return t;
            })
        }));
    };

    const handleRemoveRow = (tableId: string, rowIndex: number) => {
        setFormData(prev => ({
            ...prev,
            tables: prev.tables.map(t => {
                if (t.id === tableId) {
                    return { ...t, rows: t.rows.filter((_, idx) => idx !== rowIndex) };
                }
                return t;
            })
        }));
    };

    const handleRowDataChange = (tableId: string, rowIndex: number, colIndex: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            tables: prev.tables.map(t => {
                if (t.id === tableId) {
                    const newRows = [...t.rows];
                    newRows[rowIndex] = [...newRows[rowIndex]];
                    newRows[rowIndex][colIndex] = value;
                    return { ...t, rows: newRows };
                }
                return t;
            })
        }));
    };

    const handleAddColumn = (tableId: string) => {
        setFormData(prev => ({
            ...prev,
            tables: prev.tables.map(t => {
                if (t.id === tableId) {
                    return {
                        ...t,
                        headers: [...t.headers, 'Kolom Baru'],
                        rows: t.rows.map(row => [...row, ''])
                    };
                }
                return t;
            })
        }));
    };

    const handleRemoveColumn = (tableId: string, colIndex: number) => {
        setFormData(prev => ({
            ...prev,
            tables: prev.tables.map(t => {
                if (t.id === tableId) {
                    if (t.headers.length <= 1) return t;
                    return {
                        ...t,
                        headers: t.headers.filter((_, idx) => idx !== colIndex),
                        rows: t.rows.map(row => row.filter((_, idx) => idx !== colIndex))
                    };
                }
                return t;
            })
        }));
    };

    const handleHeaderChange = (tableId: string, colIndex: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            tables: prev.tables.map(t => {
                if (t.id === tableId) {
                    const newHeaders = [...t.headers];
                    newHeaders[colIndex] = value;
                    return { ...t, headers: newHeaders };
                }
                return t;
            })
        }));
    };

    const handleSave = async () => {
        if (!formData.memo_number || !formData.subject) {
            showError('Nomor Memo dan Perihal wajib diisi.');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const loadingToastId = showLoading('Menyimpan memo...');
        setIsSaving(true);
        try {
            await saveMemoToSupabase(formData, user.id);
            showSuccess('Memo berhasil disimpan!');
            onSaved();
        } catch (error: any) {
            console.error('Error saving memo:', error.message || error);
            showError(`Gagal menyimpan memo: ${error.message || 'Terjadi kesalahan'}`);
        } finally {
            dismissToast(loadingToastId);
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (file: File, type: 'logo_left' | 'logo_right' | 'signature' | 'stamp') => {
        try {
            const extension = file.name.split('.').pop();
            const fileName = `${type}-${Date.now()}.${extension}`;
            const path = `${type}/${fileName}`;

            const publicUrl = await uploadMemoImage(file, path);

            setFormData(prev => ({
                ...prev,
                [`${type}_url`]: publicUrl
            }));
            showSuccess('Gambar berhasil diunggah!');
        } catch (error) {
            console.error('Error uploading image:', error);
            showError('Gagal mengunggah gambar.');
        }
    };

    const generatePDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // Helper function for adding images
        const addImageFromUrl = async (url: string, x: number, y: number, w: number, h: number, makeTransparent = false) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = url;
                img.onload = () => {
                    if (makeTransparent) {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);
                            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const data = imgData.data;
                            // Make white/near-white pixels transparent
                            for (let i = 0; i < data.length; i += 4) {
                                if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
                                    data[i + 3] = 0;
                                }
                            }
                            ctx.putImageData(imgData, 0, 0);
                            doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, w, h);
                        } else {
                            doc.addImage(img, 'PNG', x, y, w, h);
                        }
                    } else {
                        doc.addImage(img, 'PNG', x, y, w, h);
                    }
                    resolve();
                };
                img.onerror = () => {
                    console.error('Failed to load image:', url);
                    resolve();
                };
            });
        };

        // Header images
        if (formData.logo_left_url) {
            await addImageFromUrl(formData.logo_left_url, 15, 12, 22, 22);
        }
        if (formData.logo_right_url) {
            await addImageFromUrl(formData.logo_right_url, pageWidth - 37, 12, 22, 22);
        }

        // Header / Kop Surat (Fixed style)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('PONDOK PESANTREN', pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text('ISLAMIC CENTRE AT-TAUHID BANGKA BELITUNG', pageWidth / 2, 22, { align: 'center' });
        doc.setFontSize(12);
        doc.text("Ma'had Tahfizh Al Qur'an At Tauhid", pageWidth / 2, 28, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Jl. Gerunggang dalam RT 08 RW 03, Kel. Air Kepala Tujuh, Kec. Gerunggang Kota Pangkalpinang', pageWidth / 2, 33, { align: 'center' });
        doc.text('Telp. 0852-6868-0049 E-mail : mtaattauhid@gmail.com', pageWidth / 2, 37, { align: 'center' });

        // Double Line Border
        doc.setLineWidth(0.5);
        doc.line(15, 40, pageWidth - 15, 40);
        doc.setLineWidth(0.2);
        doc.line(15, 41, pageWidth - 15, 41);

        // Title Section
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Bismillahirrahmanirrahim', pageWidth / 2, 48, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(formData.document_title || 'MEMO INTERNAL', pageWidth / 2, 55, { align: 'center' });
        doc.line(pageWidth / 2 - 20, 56, pageWidth / 2 + 20, 56);

        // Meta Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let currentY = 65;

        const dateFormattedDoc = new Date(formData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // Format with consistent spacing using fixed positions
        doc.text('Nomor', 20, currentY);
        doc.text(': ' + formData.memo_number, 45, currentY);
        doc.text('Perihal', 20, currentY + 6);
        doc.text(': ' + formData.subject, 45, currentY + 6);

        currentY += 15;
        
        // Only show Dari-Kepada section if enabled
        if (formData.show_from_to !== false) {
            doc.setDrawColor(0);
            doc.rect(20, currentY, pageWidth - 40, 15);
            doc.text('Dari', 25, currentY + 6);
            doc.text(': ' + formData.from, 50, currentY + 6);
            doc.text('Kepada', 25, currentY + 11);
            doc.text(': ' + formData.to, 50, currentY + 11);
            currentY += 25;
        } else {
            currentY += 10;
        }
        
        const bodyOpening = formData.opening || `Semoga Allah selalu memberikan perlindungan kepada kita semua untuk selalu istiqomah di atas jalan-Nya. Bersama dengan memo ini menyampaikan jam tambahan Guru, Jam mengajar guru sebagai berikut :`;
        const splitText = doc.splitTextToSize(bodyOpening, pageWidth - 40);
        doc.text(splitText, 20, currentY);

        currentY += splitText.length * 5 + 5;

        // Render multiple tables
        for (const table of formData.tables) {
            if (table.title) {
                doc.setFont('helvetica', 'bold');
                doc.text(table.title, pageWidth / 2, currentY, { align: 'center' });
                currentY += 6;
            }

            autoTable(doc, {
                startY: currentY,
                head: [table.headers],
                body: table.rows,
                theme: 'grid',
                headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [0, 0, 0] },
                styles: { fontSize: 9, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
                margin: { left: 20, right: 20 }
            });
            currentY = (doc as any).lastAutoTable.finalY + 10;
        }

        // Closing / Description
        const closingText = formData.description || `Semoga Allah Subhanahu wa ta’ala memberikan nikmat hidayah untuk senantiasa memperbaiki keikhlasan dalam setiap amalan kita.`;
        const splitClosing = doc.splitTextToSize(closingText, pageWidth - 40);
        
        // Check if text contains numbered list (for student data formatting)
        const hasNumberedList = /^\d+\./.test(closingText.trim());
        
        if (hasNumberedList) {
            // Use monospace font for aligned list
            doc.setFont('courier', 'normal');
            const lines = closingText.split('\n');
            lines.forEach((line) => {
                if (line.trim()) {
                    doc.text(line, 20, currentY);
                    currentY += 5;
                }
            });
            doc.setFont('helvetica', 'normal'); // Reset to normal font
            currentY += 10;
        } else {
            // Normal text wrapping
            doc.text(splitClosing, 20, currentY);
            currentY += splitClosing.length * 5 + 15;
        }

        // Signature & Stamp
        doc.text(`Pangkalpinang, ${dateFormattedDoc}`, pageWidth - 70, currentY, { align: 'center' });
        currentY += 6;
        doc.text(formData.signatory_role, pageWidth - 70, currentY, { align: 'center' });

        const sigY = currentY + 5;
        const centerX = pageWidth - 70;

        if (formData.stamp_url) {
            // Place stamp slightly left of center
            await addImageFromUrl(formData.stamp_url, centerX - 25, sigY - 5, 25, 25, true);
        }
        if (formData.signature_url) {
            // Place signature centered
            await addImageFromUrl(formData.signature_url, centerX - 15, sigY, 30, 15, true);
        }

        currentY += 25;
        doc.setFont('helvetica', 'bold underline');
        doc.text(formData.signatory_name || '...', pageWidth - 70, currentY, { align: 'center' });

        doc.save(`Memo-${formData.memo_number.replace(/\//g, '-')}.pdf`);
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex items-center justify-between sticky top-20 z-10 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md py-4 border-b border-gray-200 dark:border-slate-800">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Batal
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Download className="w-5 h-5" />
                        Preview PDF
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? 'Menyimpan...' : 'Simpan Memo'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Editor Column */}
                <div className="lg:col-span-7 space-y-6">
                    {/* logos Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('logos')}
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 text-emerald-600">
                                <ImageIcon className="w-5 h-5" />
                                Logo Sekolah (Header)
                            </h3>
                            {openSections.logos ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {openSections.logos && (
                            <div className="p-8 pt-0 border-t border-gray-50 dark:border-slate-700">
                                <div className="grid grid-cols-2 gap-6 mt-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Logo Kiri</label>
                                        <div className="relative group aspect-square rounded-2xl bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center p-4 overflow-hidden">
                                            {formData.logo_left_url ? (
                                                <>
                                                    <img src={formData.logo_left_url} className="w-full h-full object-contain" alt="Logo Kiri" />
                                                    <button
                                                        onClick={() => setFormData(p => ({ ...p, logo_left_url: '' }))}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-gray-300 mb-2" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo_left')}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase text-center">Klik untuk Upload</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Logo Kanan</label>
                                        <div className="relative group aspect-square rounded-2xl bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center p-4 overflow-hidden">
                                            {formData.logo_right_url ? (
                                                <>
                                                    <img src={formData.logo_right_url} className="w-full h-full object-contain" alt="Logo Kanan" />
                                                    <button
                                                        onClick={() => setFormData(p => ({ ...p, logo_right_url: '' }))}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-gray-300 mb-2" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo_right')}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase text-center">Klik untuk Upload</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Info Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('mainInfo')}
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                        >
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 text-emerald-600">
                                <FileText className="w-5 h-5" />
                                Informasi Utama
                            </h3>
                            {openSections.mainInfo ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {openSections.mainInfo && (
                            <div className="p-8 pt-0 border-t border-gray-50 dark:border-slate-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Judul Dokumen</label>
                                        <input
                                            type="text"
                                            value={formData.document_title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, document_title: e.target.value }))}
                                            placeholder="Contoh: MEMO INTERNAL, SURAT PERINGATAN, SURAT PERNYATAAN, dll"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold uppercase"
                                        />
                                        <p className="text-xs text-gray-400 pl-1 mt-1">Contoh: MEMO INTERNAL, SURAT PERINGATAN, SURAT PERNYATAAN, SURAT PINDAH SEKOLAH</p>
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Nomor Memo</label>
                                        <input
                                            type="text"
                                            value={formData.memo_number}
                                            onChange={(e) => setFormData(prev => ({ ...prev, memo_number: e.target.value }))}
                                            placeholder="Contoh: 61/MEMO/SMPITA/11/2025"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Perihal</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                            placeholder="Contoh: Jam Tambahan Khusus"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="showFromTo"
                                                checked={showFromTo}
                                                onChange={(e) => {
                                                    setShowFromTo(e.target.checked);
                                                    setFormData(prev => ({ ...prev, show_from_to: e.target.checked }));
                                                }}
                                                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <label htmlFor="showFromTo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tampilkan section "Dari" dan "Kepada"
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400 pl-6">Nonaktifkan untuk surat yang tidak memerlukan section Dari-Kepada (seperti Surat Keterangan)</p>
                                    </div>

                                    {showFromTo && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Dari</label>
                                                <input
                                                    type="text"
                                                    value={formData.from}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                                                    placeholder="Kepala MTA"
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Kepada</label>
                                                <input
                                                    type="text"
                                                    value={formData.to}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                                                    placeholder="Bendahara Yayasan"
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Tanggal Memo</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Muqodimah (Pembuka)</label>
                                        <textarea
                                            rows={3}
                                            value={formData.opening}
                                            onChange={(e) => setFormData(prev => ({ ...prev, opening: e.target.value }))}
                                            placeholder="Semoga Allah selalu memberikan perlindungan kepada kita semua..."
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                        />
                                        <p className="text-[10px] text-gray-400 italic font-medium px-1">Kosongkan untuk menggunakan teks standar.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table Editor Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div
                            className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                            onClick={() => toggleSection('tables')}
                        >
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 text-emerald-600">
                                <FileText className="w-5 h-5" />
                                Susunan Tabel
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAddTable(); }}
                                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border border-emerald-100"
                                >
                                    <Plus className="w-3 h-3" />
                                    Tambah Tabel
                                </button>
                                {openSections.tables ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </div>
                        </div>

                        {openSections.tables && (
                            <div className="p-8 pt-0 border-t border-gray-50 dark:border-slate-700">
                                {formData.tables.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-400 mb-4">Tidak ada tabel. Klik tombol "Tambah Tabel" untuk menambahkan tabel data.</p>
                                        <p className="text-xs text-gray-400 italic">Untuk surat tanpa tabel (seperti Surat Keterangan Pindah), Anda bisa langsung mengisi bagian Isi Surat di bawah.</p>
                                    </div>
                                ) : (
                                <div className="space-y-8 mt-6">
                                    {formData.tables.map((table, tIdx) => (
                                        <div key={table.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <GripVertical className="text-gray-400 w-4 h-4" />
                                                    <input
                                                        value={table.title}
                                                        onChange={(e) => handleTableChange(table.id, 'title', e.target.value)}
                                                        placeholder="Judul Tabel (Opsional)"
                                                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 dark:text-white w-full"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveTable(table.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="p-4 space-y-4">
                                                {/* Scrollable headers config */}
                                                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                                    {table.headers.map((h, hIdx) => (
                                                        <div key={hIdx} className="flex-shrink-0 relative group">
                                                            <input
                                                                value={h}
                                                                onChange={(e) => handleHeaderChange(table.id, hIdx, e.target.value)}
                                                                className="bg-emerald-50 dark:bg-emerald-900/30 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800 focus:ring-1 focus:ring-emerald-500 outline-none min-w-[80px]"
                                                            />
                                                            {table.headers.length > 1 && (
                                                                <button
                                                                    onClick={() => handleRemoveColumn(table.id, hIdx)}
                                                                    className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full shadow-md p-0.5 scale-0 group-hover:scale-100 transition-transform"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => handleAddColumn(table.id)}
                                                        className="flex-shrink-0 text-emerald-600 p-1 hover:bg-emerald-50 rounded-lg text-xs font-bold"
                                                    >
                                                        + Kolom
                                                    </button>
                                                </div>

                                                {/* Rows Table */}
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm border-separate border-spacing-y-2">
                                                        <thead>
                                                            <tr>
                                                                <th className="w-10 text-center py-2 px-1 text-[10px] text-gray-400 font-bold uppercase">No</th>
                                                                {table.headers.map((h, idx) => (
                                                                    <th key={idx} className="text-left py-2 px-1 text-[10px] text-gray-400 font-bold uppercase">{h}</th>
                                                                ))}
                                                                <th className="w-10"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {table.rows.map((row, rIdx) => (
                                                                <tr key={rIdx} className="group">
                                                                    <td className="text-center py-2 px-1 text-xs font-bold text-gray-400 bg-gray-50/50 dark:bg-slate-900/50 rounded-l-xl">
                                                                        {rIdx + 1}
                                                                    </td>
                                                                    {row.map((cell, cIdx) => (
                                                                        <td key={cIdx} className="py-1 px-1">
                                                                            <input
                                                                                value={cell}
                                                                                onChange={(e) => handleRowDataChange(table.id, rIdx, cIdx, e.target.value)}
                                                                                placeholder="..."
                                                                                className={`w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-gray-700 dark:text-gray-200 py-2 px-3 rounded-lg transition-all text-sm ${cIdx === row.length - 1 && 'rounded-r-none'}`}
                                                                            />
                                                                        </td>
                                                                    ))}
                                                                    <td className="text-right py-1 pr-2 bg-white dark:bg-slate-900 rounded-r-xl border-y border-r border-gray-200 dark:border-slate-700">
                                                                        <button
                                                                            onClick={() => handleRemoveRow(table.id, rIdx)}
                                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                                            title="Hapus Baris"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <button
                                                    onClick={() => handleAddRow(table.id)}
                                                    className="w-full py-2 border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-xl text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all text-xs font-bold flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Tambah Baris Data
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Signatory Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('closing')}
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                        >
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 text-emerald-600">
                                <Save className="w-5 h-5" />
                                Penutup & Pengesahan
                            </h3>
                            {openSections.closing ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {openSections.closing && (
                            <div className="p-8 pt-0 border-t border-gray-50 dark:border-slate-700">
                                <div className="space-y-6 mt-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Tanda Tangan</label>
                                            <div className="relative group aspect-video rounded-2xl bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center p-2 overflow-hidden">
                                                {formData.signature_url ? (
                                                    <>
                                                        <img src={formData.signature_url} className="w-full h-full object-contain" alt="Tanda Tangan" />
                                                        <button
                                                            onClick={() => setFormData(p => ({ ...p, signature_url: '' }))}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-gray-300 mb-1" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'signature')}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase text-center">Upload Tanda Tangan</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Stempel</label>
                                            <div className="relative group aspect-video rounded-2xl bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center p-2 overflow-hidden">
                                                {formData.stamp_url ? (
                                                    <>
                                                        <img src={formData.stamp_url} className="w-full h-full object-contain" alt="Stempel" />
                                                        <button
                                                            onClick={() => setFormData(p => ({ ...p, stamp_url: '' }))}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-gray-300 mb-1" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'stamp')}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase text-center">Upload Stempel</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Keterangan Penutup</label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Semoga Allah Subhanahu wa ta’ala memberikan nikmat hidayah..."
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Nama Pejabat</label>
                                            <input
                                                type="text"
                                                value={formData.signatory_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, signatory_name: e.target.value }))}
                                                placeholder="Azali"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Jabatan Pejabat</label>
                                            <input
                                                type="text"
                                                value={formData.signatory_role}
                                                onChange={(e) => setFormData(prev => ({ ...prev, signatory_role: e.target.value }))}
                                                placeholder="Kepala MTA At-Tauhid"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 hidden lg:block">
                    <div className="sticky top-40 bg-white shadow-2xl rounded-sm border border-gray-300 p-8 space-y-4 font-serif text-[#1e293b] overflow-hidden" style={{ minHeight: '800px', transform: 'scale(1)', transformOrigin: 'top center' }}>
                        {/* Virtual Paper Layout */}
                        {/* Kop Surat */}
                        <div className="flex items-center justify-between border-b-4 border-double border-gray-900 pb-2 relative">
                            <div className="w-12 h-12 flex items-center justify-center opacity-80 backdrop-blur-sm">
                                {formData.logo_left_url ? (
                                    <img src={formData.logo_left_url} className="w-full h-full object-contain" alt="Logo L" />
                                ) : (
                                    <span className="text-[6px] text-gray-300">LOGO L</span>
                                )}
                            </div>
                            <div className="text-center flex-1 px-4">
                                <h4 className="text-[10px] font-bold">PONDOK PESANTREN</h4>
                                <h2 className="text-[11px] font-bold uppercase">Islamic Centre At-Tauhid Bangka Belitung</h2>
                                <h3 className="text-[10px] font-bold italic">Ma’had Tahfizh Al Qur’an At Tauhid</h3>
                                <p className="text-[7px] mt-1">Jl. Gerunggang dalam RT 08 RW 03, Kel. Air Kepala Tujuh, Kec. Gerunggang Kota Pangkalpinang</p>
                                <p className="text-[7px] font-bold">Telp. 0852-6868-0049 E-mail : <span className="text-blue-600 underline">mtaattauhid@gmail.com</span></p>
                            </div>
                            <div className="w-12 h-12 flex items-center justify-center opacity-80 backdrop-blur-sm">
                                {formData.logo_right_url ? (
                                    <img src={formData.logo_right_url} className="w-full h-full object-contain" alt="Logo R" />
                                ) : (
                                    <span className="text-[6px] text-gray-300">LOGO R</span>
                                )}
                            </div>
                        </div>

                        <div className="text-center pt-2">
                            <p className="text-[10px] italic font-serif">Bismillahirrahmanirrahim</p>
                            <h1 className="text-lg font-bold underline mt-1 tracking-widest uppercase">{formData.document_title || 'MEMO INTERNAL'}</h1>
                        </div>

                        <div className="text-[11px] pt-4">
                            <div className="space-y-0.5">
                                <div className="flex">
                                    <span className="w-16 inline-block">Nomor</span>
                                    <span className="w-4 inline-block">:</span>
                                    <span>{formData.memo_number || '...'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 inline-block">Perihal</span>
                                    <span className="w-4 inline-block">:</span>
                                    <span className="underline font-bold italic">{formData.subject || '...'}</span>
                                </div>
                            </div>
                        </div>

                        {showFromTo && (
                            <div className="border border-gray-900 p-2 mt-2 text-[11px] space-y-0.5">
                                <div className="flex">
                                    <span className="w-16 inline-block">Dari</span>
                                    <span className="w-4 inline-block">:</span>
                                    <span>{formData.from || '...'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-16 inline-block">Kepada</span>
                                    <span className="w-4 inline-block">:</span>
                                    <span>{formData.to || '...'}</span>
                                </div>
                            </div>
                        )}

                        <p className="text-[10px] leading-relaxed pt-4 whitespace-pre-line">
                            {formData.opening || `Semoga Allah selalu memberikan perlindungan kepada kita semua untuk selalu istiqomah di atas jalan-Nya.\nBersamaan dengan memo ini menyampaikan jam tambahan Guru, Jam mengajar guru sebagai berikut :`}
                        </p>

                        {/* Tables Preview */}
                        <div className="space-y-6 mt-4">
                            {formData.tables.map((table, idx) => (
                                <div key={idx} className="space-y-1">
                                    {table.title && (
                                        <div className="text-center font-bold underline text-[10px]">{table.title}</div>
                                    )}
                                    <table className="w-full border-collapse border border-gray-900 text-[9px]">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                {table.headers.map((h, hIdx) => (
                                                    <th key={hIdx} className="border border-gray-900 px-2 py-1 text-center font-bold">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {table.rows.map((row, rIdx) => (
                                                <tr key={rIdx}>
                                                    {row.map((cell, cIdx) => (
                                                        <td key={cIdx} className="border border-gray-900 px-2 py-1">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>

                        <p className="text-[10px] leading-relaxed pt-4 whitespace-pre-line">
                            {formData.description || 'Semoga Allah Subhanahu wa ta’ala memberikan nikmat hidayah untuk senantiasa memperbaiki keikhlasan dalam setiap amalan kita.'}
                        </p>

                        <div className="flex flex-col items-end pt-10">
                            <div className="text-center space-y-0.5 pr-8 relative min-w-[150px]">
                                <p className="text-[10px]">Pangkalpinang, {new Date(formData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-[10px] font-bold">{formData.signatory_role}</p>
                                <div className="h-16 flex items-center justify-center relative -my-2">
                                    {formData.stamp_url && (
                                        <img src={formData.stamp_url} className="absolute left-[0px] top-[-5px] w-14 h-14 object-contain opacity-70 border-none" style={{ mixBlendMode: 'multiply' }} alt="Stempel" />
                                    )}
                                    {formData.signature_url && (
                                        <img src={formData.signature_url} className="w-16 h-10 object-contain relative z-10" style={{ mixBlendMode: 'multiply' }} alt="Signature" />
                                    )}
                                    {!formData.signature_url && !formData.stamp_url && (
                                        <span className="text-[7px] italic text-gray-300">(Stempel & Tanda Tangan)</span>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold underline">{formData.signatory_name || '...'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemoFormPage;
