export interface ReportData {
  id: string;
  date: string;
  principalName: string;
  schoolName: string;
  period: ReportPeriodKey; // Menggunakan ReportPeriodKey
  activities: Activity[];
  achievements: Achievement[];
  challenges: string[];
  plans: string[];
  // Mengganti PerformanceMetrics dengan struktur penilaian detail
  principalEvaluation: { [itemId: string]: number }; // Map item ID to selected score
  foundationEvaluation?: { [itemId: string]: number }; // Map item ID to selected score for foundation
  foundationComment?: string; // Menambahkan kolom komentar dari yayasan
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'approved';
  // Tanda tangan
  signaturePrincipal?: string | null; // Tanda tangan kepala sekolah (base64)
  signatureFoundation?: string | null; // Tanda tangan yayasan (base64)
}

export interface Activity {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string; // Diaktifkan kembali karena digunakan untuk Tanggal Pelaksanaan
  time: string;
  location: string;
  involvedParties: string;
  participants: number;
  outcome: string;
  islamicValue: string;
  goals: string;
  results: string;
  impact: string;
  challenges: string;
  solutions: string;
  followUpPlan: string;
  documentationLink: string;
  attachmentLink: string;
  additionalNotes: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  impact: string;
  evidence: string;
}

// Interface baru untuk item penilaian yang detail
export interface DetailedEvaluationItem {
  id: string; // ID unik untuk setiap item penilaian
  bidang: string;
  kategori: string;
  item: string;
  bobotOptions: { score: number; description: string }[];
}

export const activityCategories = [
  'Pembelajaran & Kurikulum',
  'Pengembangan SDM Guru / Staff',
  'Sarana Prasarana dan Lingkungan',
  'Keuangan & Administrasi',
  'Hubungan Masyarakat',
  'Pembinaan Karakter Santri',
  'Ekstrakurikuler',
  'Evaluasi & Monitoring',
  'Program Unggulan Pondok',
  'Inovasi dan Digitalisasi'
];

// Definisi tipe untuk kunci periode laporan
export type ReportPeriodKey = 'daily' | 'weekly' | 'monthly' | 'mid-semester' | 'annual' | 'special' | '';

// Pemetaan periode laporan ke Bahasa Indonesia
export const reportPeriodOptions: { [key in ReportPeriodKey]: string } = {
  '': 'Pilih periode',
  'daily': 'Harian',
  'weekly': 'Pekanan',
  'monthly': 'Bulanan',
  'mid-semester': 'Mid semester / Satu Semester',
  'annual': 'Tahunan',
  'special': 'Kegiatan Khusus'
};

// Semua item penilaian detail dari PDF
export const allDetailedEvaluationItems: DetailedEvaluationItem[] = [
  // Bidang: Keuangan
  {
    id: 'KEU-PER-001',
    bidang: 'Keuangan & Administrasi', // Diperbarui
    kategori: 'Perencanaan Keuangan Yang Baik',
    item: 'RAB disusun dan disetujui tepat waktu',
    bobotOptions: [
      { score: 10, description: 'Jika RAB disusun selambat-lambatnya tanggal 15 dan di setujui tanggal 20' },
      { score: 7.5, description: 'Jika RAB disusun selambat-lambatnya tanggal 17 dan di setujui tanggal 23' },
      { score: 2.5, description: 'Jika RAB disusun di atas tanggal 20 dan di setujui di atas tanggal 25' },
      { score: 0, description: 'Tidak Baik' },
    ],
  },
  {
    id: 'KEU-PER-002',
    bidang: 'Keuangan & Administrasi', // Diperbarui
    kategori: 'Perencanaan Keuangan Yang Baik',
    item: 'Realisasi anggaran berjalan sesuai rencana',
    bobotOptions: [
      { score: 10, description: 'Deviasi realisasi anggaran tidak melebihi 10% dari RAB' },
      { score: 7.5, description: 'Deviasi realisasi anggaran tidak melebihi 15% dari RAB' },
      { score: 2.5, description: 'Deviasi realisasi anggaran tidak melebihi 25% dari RAB' },
      { score: 0, description: 'Deviasi realisasi anggaran melebihi 25% dari RAB' },
    ],
  },
  {
    id: 'KEU-BOS-001',
    bidang: 'Keuangan & Administrasi', // Diperbarui
    kategori: 'Dana BOS atau jenis bantuan lainnya',
    item: 'Berkoordinasi terkait penganggaran, pergeseran dan perubahan anggaran',
    bobotOptions: [
      { score: 10, description: 'Berkoordinasi terkait penganggaran, pergeseran dan perubahan anggaran' },
      { score: 0, description: 'Terjadi penganggaran, pergeseran dan perubahan anggaran tanpa koordinasi' },
    ],
  },
  {
    id: 'KEU-BOS-002',
    bidang: 'Keuangan & Administrasi', // Diperbarui
    kategori: 'Dana BOS atau jenis bantuan lainnya',
    item: 'Melaporkan laporan realisasi belanja BOS ke bendahara yayasan',
    bobotOptions: [
      { score: 10, description: 'Jika laporan paling lambat 5 hari di bulan berikutnya' },
      { score: 7.5, description: 'Jika laporan paling lambat 7 hari di bulan berikutnya' },
      { score: 2.5, description: 'Jika laporan paling lambat 11 hari di bulan berikutnya' },
      { score: 0, description: 'Jika laporan melebihi 11 hari di bulan berikutnya' },
    ],
  },
  {
    id: 'KEU-BOS-003',
    bidang: 'Keuangan & Administrasi', // Diperbarui
    kategori: 'Dana BOS atau jenis bantuan lainnya',
    item: 'Menempelkan laporan realisasi belanja BOS di mading pesantren',
    bobotOptions: [
      { score: 10, description: 'Jika laporan paling lambat 5 hari di bulan berikutnya' },
      { score: 7.5, description: 'Jika laporan paling lambat 7 hari di bulan berikutnya' },
      { score: 2.5, description: 'Jika laporan paling lambat 11 hari di bulan berikutnya' },
      { score: 0, description: 'Jika laporan melebihi 11 hari di bulan berikutnya' },
    ],
  },
  {
    id: 'KEU-MON-001',
    bidang: 'Keuangan & Administrasi', // Diperbarui
    kategori: 'Monitoring biaya pendidikan',
    item: 'Memberikan surat informasi biaya pendidikan yang belum terbayar melalui wali kelas',
    bobotOptions: [
      { score: 10, description: 'diberikan ke wali murid di hari yang sama setelah menerima surat dari yayasan' },
      { score: 7.5, description: 'diberikan ke wali murid H+1 setelah menerima surat dari yayasan' },
      { score: 2.5, description: 'diberikan ke wali murid melebihi H+2 setelah menerima surat dari yayasan' },
      { score: 0, description: 'Tidak Baik' },
    ],
  },

  // Bidang: Sumber Daya Manusia
  {
    id: 'SDM-PEM-001',
    bidang: 'Pengembangan SDM Guru / Staff', // Diperbarui
    kategori: 'Pembinaan Guru',
    item: 'Melakukan Supervisi kelas MTA dan halaqoh seluruh lembaga secara rutin dan melaporkan hasil supervisi ke staf kepegawaian Yayasan',
    bobotOptions: [
      { score: 10, description: 'Jika laporan diberikan paling lambat tanggal 10' },
      { score: 7.5, description: 'Jika laporan diberikan paling lambat tanggal 12' },
      { score: 2.5, description: 'Jika laporan diberikan melebihi tanggal 14' },
      { score: 0, description: 'Tidak Baik' },
    ],
  },
  {
    id: 'SDM-PEM-002',
    bidang: 'Pengembangan SDM Guru / Staff', // Diperbarui
    kategori: 'Pembinaan Guru',
    item: 'melakukan pembinaan bagi guru MTA dan guru tahfidz semua lembaga yang memiliki catatan perbaikan',
    bobotOptions: [
      { score: 10, description: 'Tidak ada catatan atau ada catatan tetapi ditindak lanjuti dengan baik dan segera' },
      { score: 0, description: 'Ada catatan tetapi ditindak lanjuti dengan baik dan segera' },
    ],
  },
  {
    id: 'SDM-DIS-001',
    bidang: 'Pengembangan SDM Guru / Staff', // Diperbarui
    kategori: 'Pembinaan kedisiplinan guru dan pegawai MTA',
    item: 'Guru dan pegawai yang masuk dalam daftar kedisiplinan paling banyak 5%',
    bobotOptions: [
      { score: 10, description: 'Guru dan pegawai yang masuk dalam daftar kedisiplinan paling banyak 5%' },
      { score: 7.5, description: 'Guru dan pegawai yang masuk dalam daftar kedisiplinan paling banyak 10%' },
      { score: 2.5, description: 'Guru dan pegawai yang masuk dalam daftar kedisiplinan melebihi 15%' },
      { score: 0, description: 'Tidak Baik' },
    ],
  },
  {
    id: 'SDM-KOOR-001',
    bidang: 'Pengembangan SDM Guru / Staff', // Diperbarui
    kategori: 'Berkoordinasi dengan Tim',
    item: 'Berkoordinasi dengan tim', // Updated item name
    bobotOptions: [
      { score: 10, description: 'Adanya rapat rutin, mengenai evaluasi guru, kegiatan KBM, ketercapaian program dan siswa minimal sebulan sekali dan melaporkan hasil rapat ke Yayasan' },
      { score: 0, description: 'Tidak adanya rapat rutin, mengenai evaluasi guru, kegiatan KBM, ketercapaian program dan siswa minimal sebulan sekali dan melaporkan hasil rapat ke Yayasan' },
    ],
  },
  {
    id: 'SDM-KOM-001',
    bidang: 'Pengembangan SDM Guru / Staff', // Diperbarui
    kategori: 'Pengembangan kompetensi guru MTA dan guru tahfidz semua lembaga',
    item: 'Adanya kegiatan pengembangan kompetensi guru diniyah, bahasa arab, tahfidz dan umum baik secara daring atau luring',
    bobotOptions: [
      { score: 10, description: 'Adanya kegiatan pengembangan kompetensi guru diniyah, bahasa arab, tahfidz dan umum baik secara daring atau luring' },
      { score: 0, description: 'Tidak adanya kegiatan pengembangan kompetensi guru diniyah, bahasa arab, tahfidz dan umum baik secara daring atau luring' },
    ],
  },

  // Bidang: Kesiswaan
  {
    id: 'SIS-BER-001',
    bidang: 'Pembinaan Karakter Santri', // Diperbarui
    kategori: 'Kebersihan sekolah',
    item: 'Sekolah bersih, rapi, indah ada taman, hiasan dan kata kata mutiara atau motivasi di teras dan di dalam kelas',
    bobotOptions: [
      { score: 10, description: 'Sekolah bersih, rapi, indah ada taman, hiasan dan kata kata mutiara atau motivasi di teras dan di dalam kelas' },
      { score: 7.5, description: 'Sekolah bersih, rapi dan ada taman, hiasan dan kata kata mutiara atau motivasi hanya disebagian tempat' },
      { score: 2.5, description: 'Sekolah bersih dan rapi, tanpa taman, hiasan dan kata kata mutiara atau motivasi dan hanya disebagian tempat' },
      { score: 0, description: 'Sekolah kotor' },
    ],
  },
  {
    id: 'SIS-MAS-001',
    bidang: 'Pembinaan Karakter Santri', // Diperbarui
    kategori: 'Usaha untuk ketertiban di masjid',
    item: 'Masjid bersih dan rapi, siswa tertib, berdzikir dan sholat rawatib',
    bobotOptions: [
      { score: 10, description: 'Masjid bersih dan rapi, siswa tertib, berdzikir dan sholat rawatib' },
      { score: 7.5, description: 'Masjid bersih dan rapi, siswa tertib, berdzikir dan sholat rawatib, tetapi ada beberapa siswa yang tidak sholat rawatib' },
      { score: 2.5, description: 'Masjid kotor dan tidak rapi, siswa sholat tidak tertib, dan tidak sholat rawatib, serta ada beberapa siswa yang tidak sholat berjamaah' },
      { score: 0, description: 'Siswa banyak tidak sholat berjamaah' },
    ],
  },
  {
    id: 'SIS-EKS-001',
    bidang: 'Pembinaan Karakter Santri', // Diperbarui
    kategori: 'Adanya kegiatan ekstrakurikuler setiap pekan',
    item: 'Ekstrakurikuler berjalan dengan lancar setiap pekan setiap hari di hari Jumat',
    bobotOptions: [
      { score: 10, description: 'Ekstrakurikuler berjalan dengan lancar setiap pekan, ada edukasi yang bisa diperlombakan seperti pidato, kaligrafi, dll' },
      { score: 7.5, description: 'Ekstrakurikuler berjalan dengan lancar setiap pekan, ada edukasi yang bisa diperlombakan seperti pidato, kaligrafi, dll, tetapi ada beberapa siswa yang tidak ikut' },
      { score: 2.5, description: 'Ekstrakurikuler tidak berjalan dengan lancar' },
      { score: 0, description: 'Ekstrakurikuler tidak berjalan' },
    ],
  },
  {
    id: 'SIS-PEL-001',
    bidang: 'Pembinaan Karakter Santri', // Diperbarui
    kategori: 'Menurunnya tingkat pelanggaran siswa/i',
    item: 'Tidak ada pelanggaran berat sama sekali',
    bobotOptions: [
      { score: 10, description: 'Tidak ada pelanggaran berat sama sekali' },
      { score: 7.5, description: 'Jika ada pelanggaran berat namun bisa di selesaikan dengan baik' },
      { score: 2.5, description: 'Jika ada pelanggaran berat yang mengganggu kegiatan santri keseluruhan' },
      { score: 0, description: 'Jika ada pelanggaran berat yang mengganggu kegiatan santri keseluruhan dan tidak bisa di selesaikan dengan baik' },
    ],
  },

  // Bidang: Program Wali Murid
  {
    id: 'PWM-KAJ-001',
    bidang: 'Hubungan Masyarakat', // Diperbarui
    kategori: 'Adanya kegiatan kajian bersama orang tua',
    item: 'Jika kegiatan kajian sukses dan berjalan lancar dengan inisiatif dari sekolah',
    bobotOptions: [
      { score: 10, description: 'Jika kegiatan kajian sukses dan berjalan lancar dengan inisiatif dari sekolah' },
      { score: 7.5, description: 'Jika kegiatan kajian sukses dan berjalan lancar dengan inisiatif dari Yayasan terlebih dahulu' },
      { score: 2.5, description: 'Jika kegiatan kajian kurang sukses dan kurang memuaskan dan ada beberapa wali murid yang tidak ikut' },
      { score: 0, description: 'Tidak ada kajian sama sekali di bulan tersebut' },
    ],
  },
];