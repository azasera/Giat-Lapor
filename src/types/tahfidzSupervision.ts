// ============================================
// TYPES - Supervisi Guru Tahfidz
// ============================================

export interface TahfidzSupervisionSchedule {
  id: string;
  supervisor_id: string;
  teacher_id?: string;
  teacher_name: string;
  scheduled_date: string;
  scheduled_time?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  focus_areas?: string[];
  notes?: string;
  reminder_sent: boolean;
  supervision_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TahfidzSupervision {
  id: string;
  user_id: string;
  teacher_id?: string;
  teacher_name: string;
  supervision_date: string;
  period: string;
  year: string;
  status: 'draft' | 'submitted' | 'approved';
  total_score: number;
  max_score: number;
  percentage: number;
  category?: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | "Dha'if";
  notes?: string;
  recommendations?: string;
  strengths?: string;
  weaknesses?: string;
  action_plan?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  sent_to_foundation?: boolean;
  sent_to_foundation_at?: string;
  sent_by?: string;
  institution?: string;
}

export interface Teacher {
  id: string;
  name: string;
  institution?: string;
  created_at?: string;
}

export interface TahfidzSupervisionItem {
  id: string;
  supervision_id: string;
  category_number: number;
  category_name: string;
  indicator_number: number;
  indicator_text: string;
  score: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FoundationTahfidzReport {
  id: string;
  period: string;
  year: string;
  institution?: string;
  report_type: 'monthly' | 'semester' | 'annual';
  total_teachers: number;
  average_score: number;
  summary_data?: {
    distribution: {
      mumtaz: number;
      jayyid_jiddan: number;
      jayyid: number;
      maqbul: number;
      dhaif: number;
    };
    category_averages: {
      [key: string]: number;
    };
    top_performers: Array<{
      teacher_name: string;
      score: number;
      category: string;
    }>;
    needs_improvement: Array<{
      teacher_name: string;
      score: number;
      weak_areas: string[];
    }>;
  };
  recommendations?: string;
  action_plan?: string;
  strengths?: string;
  weaknesses?: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  submitted_by?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TahfidzCertificate {
  id: string;
  supervision_id: string;
  teacher_id?: string;
  teacher_name: string;
  certificate_number: string;
  category: 'Mumtaz' | 'Jayyid Jiddan';
  score: number;
  period: string;
  year: string;
  issued_by?: string;
  issued_at: string;
  qr_code?: string;
  verification_url?: string;
  created_at: string;
}

export interface TahfidzTarget {
  id: string;
  target_type: 'institutional' | 'individual';
  teacher_id?: string;
  teacher_name?: string;
  period: string;
  year: string;
  category_targets?: {
    [key: string]: number;
  };
  overall_target: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// KATEGORI & INDIKATOR
// ============================================

export interface SupervisionCategory {
  number: number;
  name: string;
  description: string;
  indicators: SupervisionIndicator[];
}

export interface SupervisionIndicator {
  number: number;
  text: string;
}

export const SUPERVISION_CATEGORIES: SupervisionCategory[] = [
  {
    number: 1,
    name: 'Kompetensi Kepribadian & Spiritual',
    description: 'Menilai akhlak, keteladanan, dan kedisiplinan guru tahfidz',
    indicators: [
      { number: 1, text: 'Berpakaian rapi, sopan, dan sesuai syariat' },
      { number: 2, text: 'Datang tepat waktu dan tidak sering meninggalkan kelas' },
      { number: 3, text: 'Menunjukkan akhlak terpuji kepada santri (sabar, lembut, tidak kasar)' },
      { number: 4, text: 'Menjadi teladan dalam amalan harian (tilawah, dzikir, shalat)' },
      { number: 5, text: 'Menjaga adab ketika mengajar Al-Qur\'an (tenang, tidak tergesa-gesa, penuh penghormatan)' }
    ]
  },
  {
    number: 2,
    name: 'Metodologi Pengajaran Tahfidz',
    description: 'Menilai kemampuan mengajar hafalan Al-Qur\'an secara efektif',
    indicators: [
      { number: 1, text: 'Memulai pembelajaran dengan doa/tilawah pembuka' },
      { number: 2, text: 'Menjelaskan target hafalan harian dengan jelas' },
      { number: 3, text: 'Menggunakan metode tahfidz yang sistematis (talaqqi, tikrar, wahdah, jama\', dsb.)' },
      { number: 4, text: 'Mampu memberi contoh bacaan yang benar, fasih, dan jelas' },
      { number: 5, text: 'Memberi pemahaman makna ayat atau konteks singkat (bila diperlukan)' },
      { number: 6, text: 'Menggunakan pendekatan bertahap sesuai kemampuan santri' }
    ]
  },
  {
    number: 3,
    name: 'Kompetensi Linguistik Qur\'ani',
    description: 'Fokus pada kualitas bacaan guru',
    indicators: [
      { number: 1, text: 'Tartil, jelas makhraj dan sifat huruf' },
      { number: 2, text: 'Menerapkan hukum tajwid dengan tepat' },
      { number: 3, text: 'Menjaga waqaf–ibtida\' dengan benar' },
      { number: 4, text: 'Bacaan model (uswah) konsisten dan tidak berubah-ubah' }
    ]
  },
  {
    number: 4,
    name: 'Manajemen Kelas Tahfidz',
    description: 'Mengatur kelas agar kondusif dan produktif',
    indicators: [
      { number: 1, text: 'Menciptakan suasana tenang, tertib, dan fokus' },
      { number: 2, text: 'Menegur santri dengan lembut namun tegas' },
      { number: 3, text: 'Mengelola waktu dengan baik antara setor, muraja\'ah, dan talqin' },
      { number: 4, text: 'Mampu mengontrol banyak santri dengan efisien' },
      { number: 5, text: 'Menghindari waktu kosong tanpa aktivitas' }
    ]
  },
  {
    number: 5,
    name: 'Pembinaan Hafalan Santri',
    description: 'Menilai strategi guru dalam membangun kualitas hafalan',
    indicators: [
      { number: 1, text: 'Konsisten membimbing muraja\'ah santri' },
      { number: 2, text: 'Memberi koreksi (tas-hih) bacaan dengan jelas dan tepat' },
      { number: 3, text: 'Memberi motivasi yang santun dan membangun semangat' },
      { number: 4, text: 'Menyesuaikan target dan metode sesuai kemampuan individu' },
      { number: 5, text: 'Memantau progres hafalan secara terstruktur' }
    ]
  },
  {
    number: 6,
    name: 'Teknik Penilaian & Pencatatan',
    description: 'Menilai kelengkapan administrasi dan akurasi penilaian guru',
    indicators: [
      { number: 1, text: 'Memiliki buku mutaba\'ah atau jurnal tahfidz yang rapi' },
      { number: 2, text: 'Penilaian setor hafalan objektif dan konsisten' },
      { number: 3, text: 'Catatan perbaikan (catatan salah baca, tajwid, kelancaran) lengkap' },
      { number: 4, text: 'Melaporkan progres hafalan santri tepat waktu' }
    ]
  },
  {
    number: 7,
    name: 'Komunikasi & Hubungan Interpersonal',
    description: 'Menilai interaksi guru dengan santri, orang tua, dan lembaga',
    indicators: [
      { number: 1, text: 'Berkomunikasi sopan dan efektif kepada santri' },
      { number: 2, text: 'Membangun hubungan positif dengan orang tua (lapor perkembangan)' },
      { number: 3, text: 'Responsif terhadap arahan pimpinan atau musyrif tahfidz' },
      { number: 4, text: 'Mampu bekerja sama dalam tim tahfidz' }
    ]
  },
  {
    number: 8,
    name: 'Motivasi & Pembinaan Karakter Santri',
    description: 'Menilai kontribusi guru terhadap pembentukan akhlak',
    indicators: [
      { number: 1, text: 'Memberi motivasi ruhiyah (keutamaan menghafal) secara berkala' },
      { number: 2, text: 'Menanamkan adab terhadap Al-Qur\'an (tsiqah, kebiasaan muraja\'ah, kedisiplinan)' },
      { number: 3, text: 'Membimbing santri ketika futur atau malas menghafal' },
      { number: 4, text: 'Mengapresiasi pencapaian santri dengan cara yang baik' }
    ]
  },
  {
    number: 9,
    name: 'Kualitas Pelaksanaan Setoran',
    description: 'Fokus pada proses guru menerima hafalan',
    indicators: [
      { number: 1, text: 'Menyimak dengan penuh perhatian (tidak sambil mengerjakan hal lain)' },
      { number: 2, text: 'Memberikan koreksi detail, bukan sekadar meluluskan setoran' },
      { number: 3, text: 'Memberi contoh ulang saat santri salah' },
      { number: 4, text: 'Menjaga standar kelulusan hafalan (bukan mempermudah)' }
    ]
  },
  {
    number: 10,
    name: 'Profesionalisme & Komitmen',
    description: 'Menilai sikap kerja dan kontribusi guru',
    indicators: [
      { number: 1, text: 'Mematuhi SOP program tahfidz' },
      { number: 2, text: 'Mengikuti rapat, pelatihan, dan pembinaan guru' },
      { number: 3, text: 'Mengirim laporan tepat waktu' },
      { number: 4, text: 'Bersedia menerima evaluasi dan perbaikan' },
      { number: 5, text: 'Menunjukkan antusiasme dalam membimbing santri' }
    ]
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getScoreLabel = (score: number): string => {
  switch (score) {
    case 5: return 'Mumtaz (Sangat Baik)';
    case 4: return 'Jayyid Jiddan (Baik Sekali)';
    case 3: return 'Jayyid (Baik)';
    case 2: return 'Maqbul (Cukup)';
    case 1: return "Dha'if (Perlu Perbaikan)";
    default: return '';
  }
};

export const getCategoryFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'Mumtaz';
  if (percentage >= 80) return 'Jayyid Jiddan';
  if (percentage >= 60) return 'Jayyid'; // Adjusted to match Score 3 (60%) label 'Jayyid'
  if (percentage >= 40) return 'Maqbul'; // Adjusted to match Score 2 (40%) label 'Maqbul'
  return "Dha'if";
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Mumtaz': return 'text-green-600 bg-green-50';
    case 'Jayyid Jiddan': return 'text-blue-600 bg-blue-50';
    case 'Jayyid': return 'text-yellow-600 bg-yellow-50';
    case 'Maqbul': return 'text-orange-600 bg-orange-50';
    case "Dha'if": return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const getPromotionRecommendation = (category: string): string => {
  switch (category) {
    case 'Mumtaz': return 'Sangat Direkomendasikan';
    case 'Jayyid Jiddan': return 'Sangat Direkomendasikan';
    case 'Jayyid': return 'Direkomendasikan';
    case 'Maqbul': return 'Dipertimbangkan';
    case "Dha'if": return 'Belum Layak';
    default: return '-';
  }
};

export const getPromotionColor = (category: string): string => {
  switch (category) {
    case 'Mumtaz': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    case 'Jayyid Jiddan': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    case 'Jayyid': return 'text-green-700 bg-green-100 border-green-200';
    case 'Maqbul': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case "Dha'if": return 'text-red-700 bg-red-100 border-red-200';
    default: return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft': return 'text-gray-600 bg-gray-100';
    case 'submitted': return 'text-blue-600 bg-blue-100';
    case 'approved': return 'text-green-600 bg-green-100';
    case 'reviewed': return 'text-purple-600 bg-purple-100';
    case 'scheduled': return 'text-blue-600 bg-blue-100';
    case 'completed': return 'text-green-600 bg-green-100';
    case 'cancelled': return 'text-red-600 bg-red-100';
    case 'rescheduled': return 'text-yellow-600 bg-yellow-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getTotalIndicators = (): number => {
  return SUPERVISION_CATEGORIES.reduce((sum, cat) => sum + cat.indicators.length, 0);
};

export const getMaxScore = (): number => {
  return getTotalIndicators() * 5;
};

// ============================================
// AI NOTES GENERATOR PER INDICATOR
// ============================================

export const generateIndicatorNote = (
  categoryName: string,
  indicatorText: string,
  score: number
): string => {
  const seed = Date.now() + Math.random() * 1000;

  // Templates based on score
  const templates = {
    5: [ // Mumtaz - Sangat Baik
      'Sangat konsisten dan sempurna dalam menerapkan.',
      'Dilakukan dengan sangat baik dan menjadi contoh.',
      'Penerapan sempurna, tidak ada yang perlu diperbaiki.',
      'Sangat memuaskan, terus pertahankan kualitas ini.',
      'Luar biasa, menjadi role model dalam aspek ini.'
    ],
    4: [ // Jayyid Jiddan - Baik Sekali
      'Sering dilakukan dengan baik, pertahankan konsistensi.',
      'Sudah baik, tingkatkan sedikit untuk mencapai sempurna.',
      'Penerapan baik, perlu sedikit peningkatan konsistensi.',
      'Memuaskan, dengan sedikit perbaikan bisa lebih optimal.',
      'Bagus, terus tingkatkan untuk hasil maksimal.'
    ],
    3: [ // Jayyid - Baik
      'Kadang-kadang diterapkan, perlu lebih konsisten.',
      'Cukup baik, namun perlu peningkatan frekuensi.',
      'Masih perlu ditingkatkan konsistensi penerapannya.',
      'Perlu lebih sering dipraktikkan untuk hasil optimal.',
      'Dapat ditingkatkan dengan latihan lebih rutin.'
    ],
    2: [ // Maqbul - Cukup
      'Jarang diterapkan, perlu perhatian khusus.',
      'Masih kurang, diperlukan perbaikan signifikan.',
      'Perlu fokus perbaikan dan pembinaan intensif.',
      'Memerlukan peningkatan serius di aspek ini.',
      'Harus menjadi prioritas perbaikan.'
    ],
    1: [ // Dha'if - Perlu Perbaikan
      'Belum diterapkan, perlu pembinaan mendesak.',
      'Memerlukan perhatian serius dan tindakan segera.',
      'Harus segera diperbaiki dengan pembinaan intensif.',
      'Perlu intervensi dan pendampingan khusus.',
      'Prioritas utama untuk perbaikan segera.'
    ]
  };

  const scoreTemplates = templates[score as keyof typeof templates] || templates[3];
  const templateIndex = Math.floor(seed % scoreTemplates.length);

  return scoreTemplates[templateIndex];
};
