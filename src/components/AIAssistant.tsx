import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  fieldName: string;
  fieldLabel: string;
  context?: {
    category?: string;
    title?: string;
    [key: string]: any;
  };
  onSuggestionSelect: (suggestion: string) => void;
  className?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  fieldName,
  fieldLabel,
  context,
  onSuggestionSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Fungsi untuk generate suggestions berdasarkan field dan context
  const generateSuggestions = () => {
    setIsLoading(true);
    
    // Simulasi AI suggestions (nanti bisa diganti dengan API call ke OpenAI/Gemini)
    setTimeout(() => {
      const newSuggestions = getSuggestionsForField(fieldName, context);
      setSuggestions(newSuggestions);
      setIsLoading(false);
    }, 500);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (suggestions.length === 0) {
      generateSuggestions();
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* AI Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md transition-all shadow-sm hover:shadow-md"
        title="Dapatkan saran AI"
      >
        <Sparkles className="w-3 h-3" />
        <span>AI Saran</span>
      </button>

      {/* AI Suggestions Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Saran AI untuk {fieldLabel}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p>Menghasilkan saran...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-semibold group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                💡 Klik salah satu saran untuk menggunakannya, atau tutup untuk menulis sendiri
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fungsi helper untuk generate suggestions berdasarkan field
function getSuggestionsForField(fieldName: string, context?: any): string[] {
  const category = context?.category || '';
  const title = context?.title || '';

  // PRIORITAS 1: Analisa judul kegiatan untuk suggestions yang sangat spesifik
  const titleBasedSuggestions = analyzeTitleAndGenerateSuggestions(title, fieldName, category, context);
  if (titleBasedSuggestions.length > 0) {
    return titleBasedSuggestions;
  }

  // PRIORITAS 2: Generate suggestions berdasarkan kategori
  const categorySpecificSuggestions = getCategorySpecificSuggestions(category, fieldName, context);
  if (categorySpecificSuggestions.length > 0) {
    return categorySpecificSuggestions;
  }

  // Fallback ke suggestions umum jika tidak ada kategori spesifik
  const suggestionDatabase: { [key: string]: string[] } = {
    // Activity fields
    'title': [
      `Rapat koordinasi ${category || 'tim'} untuk evaluasi program`,
      `Workshop peningkatan kompetensi ${category || 'guru'}`,
      `Kegiatan ${category || 'pembelajaran'} berbasis proyek`,
      `Sosialisasi program ${category || 'sekolah'} kepada stakeholder`,
      `Monitoring dan evaluasi ${category || 'kegiatan'} bulanan`
    ],
    'description': [
      `Kegiatan ini dilaksanakan untuk meningkatkan kualitas ${category || 'pembelajaran'} di sekolah dengan melibatkan seluruh ${context?.involvedParties || 'guru dan staff'}.`,
      `Pelaksanaan ${title || 'kegiatan'} ini bertujuan untuk ${category === 'Pembelajaran & Kurikulum' ? 'mengembangkan metode pembelajaran yang inovatif' : 'meningkatkan kinerja dan kompetensi'}`,
      `Dalam kegiatan ${title || 'ini'}, dilakukan pembahasan mendalam tentang strategi peningkatan mutu pendidikan yang sesuai dengan visi misi sekolah.`,
      `Kegiatan ${title || 'ini'} merupakan bagian dari program tahunan sekolah untuk ${category === 'Pembinaan Karakter Santri' ? 'membentuk karakter santri yang berakhlakul karimah' : 'meningkatkan kualitas layanan pendidikan'}.`
    ],
    'goals': [
      `Meningkatkan kualitas ${category || 'pembelajaran'} dan kompetensi ${context?.involvedParties || 'guru'}`,
      `Membangun komunikasi dan koordinasi yang efektif antar ${context?.involvedParties || 'stakeholder'}`,
      `Mengimplementasikan program ${category || 'sekolah'} sesuai dengan visi misi lembaga`,
      `Mengevaluasi dan meningkatkan efektivitas ${category || 'program'} yang sedang berjalan`,
      `Memberikan pemahaman dan keterampilan baru kepada ${context?.involvedParties || 'peserta'}`
    ],
    'results': [
      `Tercapainya kesepakatan bersama tentang ${title || 'program'} yang akan dilaksanakan`,
      `Meningkatnya pemahaman ${context?.involvedParties || 'peserta'} tentang ${category || 'materi'} yang disampaikan`,
      `Tersusunnya rencana aksi untuk implementasi ${title || 'program'} ke depan`,
      `Terlaksananya ${title || 'kegiatan'} dengan baik dan lancar sesuai jadwal`,
      `Terdokumentasinya hasil ${title || 'kegiatan'} untuk evaluasi dan tindak lanjut`
    ],
    'impact': [
      `Peningkatan kualitas ${category || 'pembelajaran'} yang lebih efektif dan efisien`,
      `Terbangunnya sinergi dan kolaborasi yang baik antar ${context?.involvedParties || 'stakeholder'}`,
      `Meningkatnya motivasi dan kompetensi ${context?.involvedParties || 'guru dan staff'}`,
      `Terwujudnya lingkungan ${category === 'Pembinaan Karakter Santri' ? 'yang kondusif untuk pembentukan karakter' : 'belajar yang lebih baik'}`,
      `Terciptanya inovasi dan perbaikan berkelanjutan dalam ${category || 'program sekolah'}`
    ],
    'challenges': [
      `Keterbatasan waktu pelaksanaan karena padatnya jadwal ${context?.involvedParties || 'peserta'}`,
      `Perbedaan pemahaman dan perspektif antar ${context?.involvedParties || 'peserta'}`,
      `Keterbatasan sarana dan prasarana pendukung kegiatan`,
      `Kendala teknis dalam pelaksanaan ${title || 'kegiatan'}`,
      `Kurangnya koordinasi awal dalam persiapan kegiatan`
    ],
    'solutions': [
      `Melakukan koordinasi dan penjadwalan ulang yang lebih matang`,
      `Menyediakan panduan dan materi yang jelas untuk semua ${context?.involvedParties || 'peserta'}`,
      `Meningkatkan komunikasi dan koordinasi antar ${context?.involvedParties || 'pihak terkait'}`,
      `Melakukan persiapan teknis yang lebih detail sebelum pelaksanaan`,
      `Membentuk tim khusus untuk monitoring dan evaluasi berkelanjutan`
    ],
    'followUpPlan': [
      `Melaksanakan monitoring dan evaluasi rutin terhadap implementasi hasil ${title || 'kegiatan'}`,
      `Menyusun jadwal kegiatan lanjutan untuk pendalaman materi`,
      `Membentuk tim kerja untuk implementasi program yang telah disepakati`,
      `Melakukan sosialisasi hasil ${title || 'kegiatan'} kepada seluruh ${context?.involvedParties || 'stakeholder'}`,
      `Menyusun laporan lengkap dan rekomendasi untuk kegiatan serupa di masa mendatang`
    ],
    
    // Achievement fields
    'achievement_title': [
      `Prestasi ${category || 'akademik'} tingkat ${context?.level || 'kabupaten/kota'}`,
      `Penghargaan untuk ${category || 'inovasi'} dalam bidang pendidikan`,
      `Pencapaian target ${category || 'program'} sekolah tahun ini`,
      `Keberhasilan implementasi ${category || 'program unggulan'} sekolah`
    ],
    'achievement_description': [
      `Sekolah berhasil meraih prestasi ${title || 'ini'} melalui kerja keras dan dedikasi seluruh ${context?.involvedParties || 'warga sekolah'}`,
      `Pencapaian ini merupakan hasil dari implementasi program ${category || 'sekolah'} yang konsisten dan berkelanjutan`,
      `Prestasi ${title || 'ini'} membuktikan komitmen sekolah dalam meningkatkan kualitas ${category || 'pendidikan'}`
    ],
    'achievement_impact': [
      `Meningkatkan reputasi dan kredibilitas sekolah di mata masyarakat`,
      `Memotivasi seluruh ${context?.involvedParties || 'warga sekolah'} untuk terus berprestasi`,
      `Membuka peluang kerjasama dan dukungan dari berbagai pihak`,
      `Menjadi inspirasi bagi sekolah lain untuk mengembangkan program serupa`
    ],
    'achievement_evidence': [
      `Sertifikat/piagam penghargaan dari ${context?.organizer || 'penyelenggara'}`,
      `Dokumentasi foto dan video kegiatan`,
      `Publikasi di media massa dan media sosial sekolah`,
      `Laporan lengkap pelaksanaan program yang mendapat apresiasi`
    ]
  };

  return suggestionDatabase[fieldName] || [
    'Silakan isi field ini dengan informasi yang relevan',
    'Jelaskan secara detail dan spesifik',
    'Gunakan bahasa yang jelas dan mudah dipahami'
  ];
}

// Fungsi untuk generate suggestions yang lebih cerdas berdasarkan kategori
function getCategorySpecificSuggestions(category: string, fieldName: string, context?: any): string[] {
  const title = context?.title || '';
  
  // Suggestions spesifik untuk setiap kategori
  const categoryMap: { [key: string]: { [field: string]: string[] } } = {
    'Pembelajaran & Kurikulum': {
      'goals': [
        'Meningkatkan kualitas pembelajaran dengan cara mengajar yang lebih menarik',
        'Menyusun rencana pembelajaran yang sesuai dengan kebutuhan santri',
        'Meningkatkan kemampuan guru dalam mengajar dengan cara yang lebih baik',
        'Memastikan santri mencapai target belajar yang sudah ditetapkan',
        'Memasukkan nilai-nilai Islam dalam setiap kegiatan belajar'
      ],
      'results': [
        'Pembelajaran menjadi lebih menarik dan santri lebih semangat belajar',
        'Tersusunnya rencana pembelajaran yang lengkap dan sesuai visi pesantren',
        'Guru lebih terampil dalam mengajar dan mengelola kelas',
        'Target pembelajaran tercapai dengan baik sesuai yang diharapkan',
        'Nilai-nilai akhlak mulia masuk dalam setiap kegiatan belajar'
      ],
      'impact': [
        'Santri lebih semangat dan senang mengikuti pelajaran',
        'Ilmu yang dipelajari bisa diterapkan dalam kehidupan sehari-hari',
        'Prestasi belajar santri meningkat dengan baik',
        'Tercipta suasana belajar yang nyaman dan Islami',
        'Santri menjadi pribadi yang berilmu dan berakhlak baik'
      ],
      'challenges': [
        'Waktu yang terbatas untuk menyiapkan cara mengajar yang baru',
        'Kemampuan santri yang berbeda-beda dalam memahami pelajaran',
        'Kurangnya alat bantu dan bahan ajar yang mendukung',
        'Kesulitan dalam menggunakan teknologi untuk mengajar',
        'Waktu yang kurang untuk mengevaluasi hasil pembelajaran'
      ],
      'solutions': [
        'Mengadakan pelatihan dan pendampingan untuk guru secara rutin',
        'Menyesuaikan cara mengajar dengan kemampuan masing-masing santri',
        'Memanfaatkan alat bantu yang ada dan membuat media sederhana',
        'Mengadakan pelatihan penggunaan teknologi secara bertahap',
        'Menyediakan waktu khusus untuk mengevaluasi hasil pembelajaran'
      ],
      'followUpPlan': [
        'Melakukan pengawasan pembelajaran secara rutin untuk menjaga kualitas',
        'Mengadakan pertemuan guru untuk berbagi cara mengajar yang baik',
        'Menyusun kumpulan soal dan cara penilaian yang tepat',
        'Membuat buku panduan pembelajaran yang sesuai dengan kondisi pesantren',
        'Melakukan evaluasi rencana pembelajaran secara berkala untuk perbaikan'
      ]
    },
    'Hubungan Masyarakat': {
      'goals': [
        'Membangun komunikasi dan kerjasama yang harmonis dengan orang tua santri',
        'Meningkatkan partisipasi orang tua dalam mendukung pendidikan santri di pesantren',
        'Mensosialisasikan program dan kebijakan pesantren kepada stakeholder',
        'Membangun citra positif pesantren di masyarakat',
        'Menjalin kemitraan strategis dengan lembaga dan instansi terkait'
      ],
      'results': [
        'Terjalinnya komunikasi yang efektif antara pesantren dengan orang tua santri',
        'Meningkatnya pemahaman orang tua tentang program dan perkembangan santri',
        'Terlaksananya program kerjasama dengan berbagai pihak untuk kemajuan pesantren',
        'Meningkatnya kepercayaan masyarakat terhadap pesantren',
        'Terbentuknya forum komunikasi orang tua santri yang aktif'
      ],
      'impact': [
        'Terciptanya sinergi antara pesantren dan keluarga dalam mendidik santri',
        'Meningkatnya dukungan orang tua terhadap program pesantren',
        'Terwujudnya lingkungan pendidikan yang kondusif dengan dukungan semua pihak',
        'Meningkatnya animo masyarakat untuk menyekolahkan anaknya di pesantren',
        'Terbukanya peluang kerjasama dan bantuan dari berbagai pihak'
      ],
      'challenges': [
        'Keterbatasan waktu orang tua untuk hadir dalam kegiatan pesantren',
        'Perbedaan latar belakang dan pemahaman orang tua yang beragam',
        'Jarak tempat tinggal orang tua yang berjauhan',
        'Kurangnya media komunikasi yang efektif dengan orang tua',
        'Kesibukan orang tua dalam pekerjaan sehari-hari'
      ],
      'solutions': [
        'Menggunakan berbagai media komunikasi (WhatsApp, website, buletin) untuk menjangkau orang tua',
        'Menyediakan materi sosialisasi yang mudah dipahami dan menarik',
        'Mengadakan kegiatan di waktu yang fleksibel (weekend atau libur)',
        'Membentuk perwakilan orang tua di setiap kelas untuk mempermudah koordinasi',
        'Melakukan home visit atau kunjungan ke rumah orang tua secara berkala'
      ],
      'followUpPlan': [
        'Membuat jadwal pertemuan rutin dengan orang tua santri setiap semester',
        'Mengembangkan aplikasi atau sistem informasi untuk komunikasi dengan orang tua',
        'Melaksanakan program parenting untuk meningkatkan kapasitas orang tua',
        'Membuat laporan perkembangan santri secara berkala kepada orang tua',
        'Menjalin kerjasama dengan komite sekolah untuk program-program strategis'
      ]
    },
    'Pembinaan Karakter Santri': {
      'goals': [
        'Membentuk karakter santri yang berakhlakul karimah sesuai nilai-nilai Islam',
        'Menanamkan nilai-nilai kejujuran, disiplin, dan tanggung jawab dalam diri santri',
        'Mengembangkan kepribadian santri yang mandiri dan percaya diri',
        'Membiasakan santri untuk beribadah dan beramal shaleh dalam kehidupan sehari-hari',
        'Membentuk santri yang memiliki kepedulian sosial dan jiwa kepemimpinan'
      ],
      'results': [
        'Terlaksananya program pembinaan karakter secara terstruktur dan berkelanjutan',
        'Meningkatnya kesadaran santri untuk berperilaku sesuai akhlak Islam',
        'Terbentuknya kebiasaan positif dalam keseharian santri di pesantren',
        'Meningkatnya partisipasi santri dalam kegiatan keagamaan dan sosial',
        'Terciptanya lingkungan pesantren yang Islami dan kondusif'
      ],
      'impact': [
        'Terbentuknya santri yang memiliki akhlak mulia dan menjadi teladan di masyarakat',
        'Meningkatnya kedisiplinan dan tanggung jawab santri dalam belajar dan beribadah',
        'Terciptanya budaya pesantren yang Islami dan harmonis',
        'Meningkatnya kepercayaan orang tua terhadap pembinaan di pesantren',
        'Terwujudnya generasi muda yang berilmu, berakhlak, dan bermanfaat bagi umat'
      ],
      'challenges': [
        'Perbedaan latar belakang dan karakter santri yang beragam',
        'Pengaruh lingkungan dan media sosial yang kurang mendukung',
        'Keterbatasan waktu untuk pembinaan karakter secara intensif',
        'Kurangnya keteladanan dari sebagian pembina',
        'Kesulitan dalam mengubah kebiasaan buruk yang sudah melekat'
      ],
      'solutions': [
        'Menerapkan sistem pembinaan yang terstruktur dengan pendampingan intensif',
        'Memberikan keteladanan nyata dari para ustadz dan pengurus pesantren',
        'Mengintegrasikan pembinaan karakter dalam setiap kegiatan pesantren',
        'Melibatkan orang tua dalam pembinaan karakter santri',
        'Memberikan reward dan punishment yang mendidik dan konsisten'
      ],
      'followUpPlan': [
        'Melaksanakan monitoring dan evaluasi perkembangan karakter santri secara berkala',
        'Mengadakan program mentoring dan bimbingan konseling untuk santri',
        'Menyusun buku panduan pembinaan karakter untuk santri dan pembina',
        'Melaksanakan kegiatan outbound dan leadership training',
        'Membuat program kerjasama dengan orang tua untuk pembinaan karakter di rumah'
      ]
    },
    'Pengembangan SDM Guru / Staff': {
      'goals': [
        'Meningkatkan kompetensi profesional guru dan staff dalam menjalankan tugas',
        'Mengembangkan kemampuan pedagogik dan metodologi pembelajaran guru',
        'Meningkatkan motivasi dan kinerja guru dan staff',
        'Membangun budaya belajar dan inovasi di kalangan pendidik',
        'Mempersiapkan guru dan staff yang adaptif terhadap perkembangan zaman'
      ],
      'results': [
        'Terlaksananya program pelatihan dan pengembangan SDM secara berkala',
        'Meningkatnya pengetahuan dan keterampilan guru dalam pembelajaran',
        'Tersusunnya rencana pengembangan karir untuk guru dan staff',
        'Terbentuknya komunitas belajar (learning community) antar guru',
        'Meningkatnya kepuasan kerja dan loyalitas guru dan staff'
      ],
      'impact': [
        'Meningkatnya kualitas pembelajaran dan layanan pendidikan di pesantren',
        'Terwujudnya guru yang profesional dan inovatif dalam mengajar',
        'Meningkatnya prestasi dan kepuasan santri dalam belajar',
        'Terciptanya iklim kerja yang positif dan produktif',
        'Meningkatnya reputasi pesantren sebagai lembaga pendidikan berkualitas'
      ],
      'challenges': [
        'Keterbatasan anggaran untuk program pelatihan dan pengembangan',
        'Kesulitan mengatur waktu pelatihan di tengah kesibukan mengajar',
        'Perbedaan tingkat kompetensi dan motivasi guru yang beragam',
        'Kurangnya narasumber atau trainer yang kompeten',
        'Resistensi terhadap perubahan dari sebagian guru senior'
      ],
      'solutions': [
        'Mengalokasikan anggaran khusus untuk pengembangan SDM secara konsisten',
        'Mengadakan pelatihan di waktu libur atau menggunakan sistem shift',
        'Menerapkan sistem mentoring dari guru senior ke guru junior',
        'Menjalin kerjasama dengan lembaga pelatihan dan perguruan tinggi',
        'Memberikan apresiasi dan insentif bagi guru yang aktif mengikuti pengembangan'
      ],
      'followUpPlan': [
        'Menyusun roadmap pengembangan SDM jangka panjang',
        'Melaksanakan supervisi dan coaching secara rutin',
        'Mengadakan sharing session dan workshop internal secara berkala',
        'Memfasilitasi guru untuk melanjutkan pendidikan ke jenjang lebih tinggi',
        'Membuat sistem penilaian kinerja yang objektif dan transparan'
      ]
    },
    'Sarana Prasarana dan Lingkungan': {
      'goals': [
        'Menyediakan sarana prasarana yang memadai untuk mendukung pembelajaran',
        'Memelihara dan merawat fasilitas pesantren agar selalu dalam kondisi baik',
        'Menciptakan lingkungan pesantren yang bersih, sehat, dan nyaman',
        'Mengoptimalkan pemanfaatan sarana prasarana yang ada',
        'Mengembangkan fasilitas pesantren sesuai kebutuhan dan perkembangan'
      ],
      'results': [
        'Terlaksananya program pemeliharaan dan perawatan fasilitas secara rutin',
        'Tersedianya sarana prasarana yang layak dan memadai untuk kegiatan',
        'Terciptanya lingkungan pesantren yang bersih, hijau, dan asri',
        'Meningkatnya efektivitas penggunaan sarana prasarana',
        'Terdokumentasinya inventaris dan kondisi sarana prasarana dengan baik'
      ],
      'impact': [
        'Meningkatnya kenyamanan dan keamanan santri dalam belajar dan beraktivitas',
        'Terwujudnya lingkungan belajar yang kondusif dan mendukung prestasi',
        'Meningkatnya kesehatan dan kebersihan lingkungan pesantren',
        'Terciptanya citra positif pesantren di mata masyarakat',
        'Meningkatnya efisiensi dan efektivitas kegiatan pembelajaran'
      ],
      'challenges': [
        'Keterbatasan anggaran untuk pengadaan dan pemeliharaan fasilitas',
        'Kerusakan fasilitas akibat penggunaan yang kurang hati-hati',
        'Kurangnya kesadaran warga pesantren untuk menjaga kebersihan',
        'Fasilitas yang sudah tua dan memerlukan renovasi',
        'Keterbatasan lahan untuk pengembangan fasilitas baru'
      ],
      'solutions': [
        'Menyusun skala prioritas pengadaan dan pemeliharaan fasilitas',
        'Melibatkan santri dalam program pemeliharaan dan kebersihan lingkungan',
        'Membuat jadwal piket dan petugas kebersihan yang jelas',
        'Melakukan renovasi bertahap sesuai kemampuan anggaran',
        'Mengoptimalkan pemanfaatan lahan yang ada secara kreatif'
      ],
      'followUpPlan': [
        'Menyusun master plan pengembangan sarana prasarana jangka panjang',
        'Melaksanakan inspeksi dan audit fasilitas secara berkala',
        'Mengadakan program go green dan penghijauan lingkungan',
        'Membuat sistem pelaporan kerusakan fasilitas yang cepat dan responsif',
        'Menjalin kerjasama dengan donatur untuk pengembangan fasilitas'
      ]
    },
    'Keuangan & Administrasi': {
      'goals': [
        'Mengelola keuangan pesantren secara transparan dan akuntabel',
        'Meningkatkan efisiensi pengelolaan administrasi pesantren',
        'Memastikan tertib administrasi keuangan dan dokumen pesantren',
        'Mengoptimalkan pemanfaatan anggaran untuk program prioritas',
        'Membangun sistem pelaporan keuangan yang akurat dan tepat waktu'
      ],
      'results': [
        'Tersusunnya laporan keuangan yang lengkap dan akurat',
        'Terlaksananya pengelolaan keuangan sesuai prinsip syariah',
        'Tertibnya administrasi dokumen dan arsip pesantren',
        'Meningkatnya efisiensi penggunaan anggaran',
        'Terdokumentasinya seluruh transaksi keuangan dengan baik'
      ],
      'impact': [
        'Meningkatnya kepercayaan stakeholder terhadap pengelolaan keuangan',
        'Terwujudnya transparansi dan akuntabilitas dalam pengelolaan dana',
        'Terciptanya sistem administrasi yang tertib dan mudah diakses',
        'Meningkatnya efektivitas penggunaan dana untuk program pesantren',
        'Terpenuhinya standar audit dan pelaporan keuangan'
      ],
      'challenges': [
        'Kompleksitas pencatatan transaksi keuangan yang beragam',
        'Keterbatasan SDM yang kompeten dalam bidang keuangan',
        'Kurangnya sistem informasi keuangan yang terintegrasi',
        'Kesulitan dalam mengontrol pengeluaran yang tidak terencana',
        'Keterlambatan pelaporan dari unit-unit kerja'
      ],
      'solutions': [
        'Menggunakan aplikasi keuangan untuk mempermudah pencatatan',
        'Memberikan pelatihan akuntansi dan keuangan kepada staff',
        'Menerapkan sistem approval dan otorisasi yang jelas',
        'Membuat anggaran yang detail dan monitoring secara berkala',
        'Menetapkan deadline pelaporan yang ketat dan konsisten'
      ],
      'followUpPlan': [
        'Melakukan audit internal secara berkala',
        'Menyusun standar operasional prosedur (SOP) keuangan',
        'Mengadakan rapat evaluasi keuangan setiap bulan',
        'Mengembangkan sistem informasi manajemen keuangan',
        'Melakukan sosialisasi kebijakan keuangan kepada seluruh warga pesantren'
      ]
    },
    'Ekstrakurikuler': {
      'goals': [
        'Mengembangkan bakat dan minat santri melalui kegiatan ekstrakurikuler',
        'Membentuk karakter dan soft skills santri di luar pembelajaran formal',
        'Meningkatkan prestasi santri di bidang non-akademik',
        'Menyediakan wadah untuk santri mengekspresikan kreativitas',
        'Mempersiapkan santri untuk berkompetisi di tingkat yang lebih tinggi'
      ],
      'results': [
        'Terlaksananya program ekstrakurikuler yang variatif dan menarik',
        'Meningkatnya partisipasi santri dalam kegiatan ekstrakurikuler',
        'Terbentuknya tim atau kelompok ekstrakurikuler yang solid',
        'Tercapainya prestasi di berbagai lomba dan kompetisi',
        'Berkembangnya bakat dan minat santri secara optimal'
      ],
      'impact': [
        'Terbentuknya santri yang memiliki keterampilan dan bakat yang beragam',
        'Meningkatnya kepercayaan diri dan jiwa kompetitif santri',
        'Terciptanya keseimbangan antara prestasi akademik dan non-akademik',
        'Meningkatnya citra positif pesantren melalui prestasi santri',
        'Terwujudnya santri yang kreatif, inovatif, dan berprestasi'
      ],
      'challenges': [
        'Keterbatasan waktu santri di antara jadwal pembelajaran yang padat',
        'Kurangnya pembina atau pelatih yang kompeten di bidangnya',
        'Keterbatasan sarana dan prasarana untuk kegiatan ekstrakurikuler',
        'Rendahnya motivasi sebagian santri untuk mengikuti ekstrakurikuler',
        'Kesulitan dalam mengatur jadwal yang tidak bentrok dengan kegiatan lain'
      ],
      'solutions': [
        'Mengintegrasikan ekstrakurikuler dalam jadwal resmi pesantren',
        'Menjalin kerjasama dengan pelatih atau coach dari luar',
        'Mengoptimalkan fasilitas yang ada dan mencari sponsor untuk peralatan',
        'Memberikan apresiasi dan reward bagi santri berprestasi',
        'Membuat jadwal ekstrakurikuler yang fleksibel dan terkoordinasi'
      ],
      'followUpPlan': [
        'Mengadakan festival atau showcase ekstrakurikuler setiap semester',
        'Mendaftarkan santri untuk mengikuti kompetisi di berbagai tingkat',
        'Membuat program pembinaan khusus untuk santri berbakat',
        'Melakukan evaluasi dan pengembangan program ekstrakurikuler',
        'Menjalin kerjasama dengan komunitas atau organisasi terkait'
      ]
    },
    'Evaluasi & Monitoring': {
      'goals': [
        'Melakukan evaluasi berkala terhadap program dan kegiatan pesantren',
        'Memantau pencapaian target dan indikator kinerja pesantren',
        'Mengidentifikasi kekuatan dan area perbaikan dalam pengelolaan',
        'Memastikan akuntabilitas dan transparansi dalam pelaksanaan program',
        'Menyusun rekomendasi perbaikan berdasarkan hasil evaluasi'
      ],
      'results': [
        'Terlaksananya evaluasi program secara sistematis dan objektif',
        'Teridentifikasinya capaian dan kendala dalam pelaksanaan program',
        'Tersusunnya laporan evaluasi yang komprehensif dan akurat',
        'Terdokumentasinya data dan informasi untuk pengambilan keputusan',
        'Terumuskannya rekomendasi perbaikan yang aplikatif'
      ],
      'impact': [
        'Meningkatnya kualitas program dan layanan pesantren',
        'Terwujudnya perbaikan berkelanjutan (continuous improvement)',
        'Meningkatnya akuntabilitas pengelolaan pesantren',
        'Terciptanya budaya evaluasi dan refleksi di kalangan pengelola',
        'Meningkatnya kepercayaan stakeholder terhadap kinerja pesantren'
      ],
      'challenges': [
        'Keterbatasan instrumen evaluasi yang valid dan reliabel',
        'Kurangnya budaya evaluasi dan dokumentasi yang baik',
        'Kesulitan dalam mengumpulkan data yang akurat dan lengkap',
        'Resistensi dari pihak yang dievaluasi',
        'Keterbatasan waktu untuk melakukan evaluasi yang mendalam'
      ],
      'solutions': [
        'Menyusun instrumen evaluasi yang terstandar dan mudah digunakan',
        'Membangun budaya evaluasi melalui sosialisasi dan pembiasaan',
        'Menggunakan sistem informasi untuk memudahkan pengumpulan data',
        'Melibatkan semua pihak dalam proses evaluasi secara partisipatif',
        'Menjadwalkan waktu khusus untuk evaluasi secara berkala'
      ],
      'followUpPlan': [
        'Melaksanakan rapat evaluasi dan tindak lanjut secara rutin',
        'Menyusun action plan berdasarkan hasil evaluasi',
        'Melakukan monitoring implementasi rekomendasi perbaikan',
        'Mengembangkan dashboard kinerja untuk monitoring real-time',
        'Melakukan evaluasi dampak program terhadap santri dan pesantren'
      ]
    }
  };

  // Cek apakah ada suggestions spesifik untuk kategori ini
  if (categoryMap[category] && categoryMap[category][fieldName]) {
    return categoryMap[category][fieldName];
  }

  return [];
}

// Fungsi CERDAS untuk menganalisa judul dan generate suggestions spesifik
function analyzeTitleAndGenerateSuggestions(
  title: string, 
  fieldName: string, 
  category: string,
  context?: any
): string[] {
  if (!title || title.trim() === '') return [];
  
  const titleLower = title.toLowerCase();
  
  // Deteksi kata kunci dalam judul untuk suggestions yang sangat spesifik
  const keywords = {
    // Kata kunci tentang pertemuan/rapat
    rapat: ['rapat', 'pertemuan', 'meeting', 'koordinasi'],
    kajian: ['kajian', 'pengajian', 'tausiyah', 'ceramah', 'kuliah'],
    pelatihan: ['pelatihan', 'workshop', 'training', 'bimtek', 'diklat'],
    workshop: ['workshop', 'pelatihan', 'training', 'bimtek', 'diklat'],
    orangtua: ['orang tua', 'orangtua', 'wali', 'wali santri', 'wali murid'],
    santri: ['santri', 'siswa', 'murid', 'peserta didik'],
    guru: ['guru', 'ustadz', 'ustadzah', 'pengajar', 'pendidik'],
    evaluasi: ['evaluasi', 'penilaian', 'asesmen', 'ujian', 'ulangan'],
    kunjungan: ['kunjungan', 'kunjung', 'visit', 'silaturahmi'],
    lomba: ['lomba', 'kompetisi', 'pertandingan', 'turnamen'],
    kegiatan: ['kegiatan', 'acara', 'program', 'agenda'],
    pembinaan: ['pembinaan', 'bimbingan', 'mentoring', 'coaching'],
    sosialisasi: ['sosialisasi', 'pengenalan', 'perkenalan', 'informasi']
  };

  // Fungsi helper untuk cek kata kunci
  const hasKeyword = (keywordList: string[]) => {
    return keywordList.some(keyword => titleLower.includes(keyword));
  };

  // Generate suggestions berdasarkan analisa judul
  if (fieldName === 'goals') {
    // TUJUAN - Analisa judul untuk tujuan yang spesifik
    if (hasKeyword(keywords.kajian) && hasKeyword(keywords.orangtua)) {
      return [
        'Membangun hubungan yang baik antara pesantren dengan orang tua santri',
        'Memberikan pemahaman kepada orang tua tentang perkembangan anak di pesantren',
        'Mendengarkan masukan dan saran dari orang tua untuk kemajuan pesantren',
        'Meningkatkan kerjasama orang tua dalam mendidik anak',
        'Menyampaikan program dan kegiatan pesantren kepada orang tua'
      ];
    }
    
    if (hasKeyword(keywords.rapat) && hasKeyword(keywords.guru)) {
      return [
        'Membahas dan mengevaluasi kegiatan pembelajaran yang sudah berjalan',
        'Menyusun rencana pembelajaran untuk periode mendatang',
        'Meningkatkan kerjasama dan koordinasi antar guru',
        'Memecahkan masalah yang dihadapi dalam proses belajar mengajar',
        'Meningkatkan kualitas pengajaran di pesantren'
      ];
    }
    
    if (hasKeyword(keywords.pelatihan) || hasKeyword(keywords.workshop)) {
      return [
        'Meningkatkan kemampuan dan keterampilan peserta dalam bidang yang dilatih',
        'Memberikan pengetahuan baru yang bermanfaat untuk pekerjaan sehari-hari',
        'Meningkatkan kualitas kerja melalui cara-cara yang lebih baik',
        'Membekali peserta dengan keterampilan yang dibutuhkan',
        'Meningkatkan semangat dan motivasi dalam bekerja'
      ];
    }
    
    if (hasKeyword(keywords.evaluasi)) {
      return [
        'Mengetahui sejauh mana pencapaian target yang sudah ditetapkan',
        'Mengidentifikasi kekuatan dan kelemahan dalam pelaksanaan program',
        'Mencari solusi untuk memperbaiki hal-hal yang masih kurang',
        'Memastikan semua kegiatan berjalan sesuai rencana',
        'Menyusun rencana perbaikan untuk ke depannya'
      ];
    }
    
    if (hasKeyword(keywords.pembinaan) && hasKeyword(keywords.santri)) {
      return [
        'Membentuk akhlak dan perilaku santri yang baik',
        'Meningkatkan kedisiplinan dan tanggung jawab santri',
        'Membantu santri mengatasi masalah yang dihadapi',
        'Membimbing santri agar lebih rajin belajar dan beribadah',
        'Memotivasi santri untuk menjadi pribadi yang lebih baik'
      ];
    }
  }
  
  if (fieldName === 'results') {
    // HASIL - Analisa judul untuk hasil yang spesifik
    if (hasKeyword(keywords.kajian) && hasKeyword(keywords.orangtua)) {
      return [
        'Orang tua lebih memahami program dan kegiatan pesantren',
        'Terjalin komunikasi yang baik antara pesantren dengan orang tua',
        'Orang tua memberikan dukungan penuh terhadap program pesantren',
        'Terkumpulnya masukan dan saran yang bermanfaat dari orang tua',
        'Meningkatnya kepercayaan orang tua terhadap pesantren'
      ];
    }
    
    if (hasKeyword(keywords.rapat) && hasKeyword(keywords.guru)) {
      return [
        'Tersusunnya rencana pembelajaran yang lebih baik',
        'Teridentifikasinya masalah dan solusi dalam pembelajaran',
        'Meningkatnya kerjasama dan koordinasi antar guru',
        'Tercapainya kesepakatan bersama untuk kemajuan pesantren',
        'Terdokumentasinya hasil rapat untuk tindak lanjut'
      ];
    }
    
    if (hasKeyword(keywords.pelatihan)) {
      return [
        'Peserta mendapatkan pengetahuan dan keterampilan baru',
        'Meningkatnya kemampuan peserta dalam bidang yang dilatih',
        'Peserta lebih termotivasi untuk menerapkan ilmu yang didapat',
        'Terbentuknya pemahaman yang sama tentang cara kerja yang baik',
        'Peserta siap menerapkan hasil pelatihan dalam pekerjaan'
      ];
    }
    
    if (hasKeyword(keywords.evaluasi)) {
      return [
        'Teridentifikasinya pencapaian dan kendala dalam program',
        'Tersusunnya daftar hal-hal yang perlu diperbaiki',
        'Terkumpulnya data dan informasi untuk pengambilan keputusan',
        'Tercapainya kesepakatan tentang langkah perbaikan',
        'Terdokumentasinya hasil evaluasi dengan lengkap'
      ];
    }
  }
  
  if (fieldName === 'impact') {
    // DAMPAK - Analisa judul untuk dampak yang spesifik
    if (hasKeyword(keywords.kajian) && hasKeyword(keywords.orangtua)) {
      return [
        'Orang tua lebih aktif mendukung pendidikan anak di pesantren',
        'Terjalin kerjasama yang baik antara rumah dan pesantren',
        'Meningkatnya kepedulian orang tua terhadap perkembangan anak',
        'Terciptanya lingkungan yang mendukung pendidikan anak',
        'Meningkatnya kepercayaan masyarakat terhadap pesantren'
      ];
    }
    
    if (hasKeyword(keywords.pelatihan) && hasKeyword(keywords.guru)) {
      return [
        'Meningkatnya kualitas pembelajaran di kelas',
        'Guru lebih kreatif dan inovatif dalam mengajar',
        'Santri lebih semangat dan mudah memahami pelajaran',
        'Terciptanya suasana belajar yang lebih menyenangkan',
        'Meningkatnya prestasi belajar santri'
      ];
    }
    
    if (hasKeyword(keywords.pembinaan) && hasKeyword(keywords.santri)) {
      return [
        'Santri lebih disiplin dan bertanggung jawab',
        'Meningkatnya akhlak dan perilaku baik santri',
        'Santri lebih rajin belajar dan beribadah',
        'Terciptanya lingkungan pesantren yang lebih kondusif',
        'Santri menjadi teladan yang baik di masyarakat'
      ];
    }
  }
  
  if (fieldName === 'challenges') {
    // KENDALA - Analisa judul untuk kendala yang umum
    if (hasKeyword(keywords.orangtua)) {
      return [
        'Sebagian orang tua tidak bisa hadir karena kesibukan kerja',
        'Jarak rumah orang tua yang jauh dari pesantren',
        'Waktu pelaksanaan yang kurang sesuai dengan jadwal orang tua',
        'Kurangnya pemahaman sebagian orang tua tentang program pesantren',
        'Keterbatasan media komunikasi dengan orang tua'
      ];
    }
    
    if (hasKeyword(keywords.pelatihan)) {
      return [
        'Waktu pelatihan yang terbatas untuk materi yang banyak',
        'Perbedaan tingkat pemahaman peserta yang beragam',
        'Keterbatasan sarana dan alat untuk praktik',
        'Sebagian peserta kurang fokus karena kelelahan',
        'Kesulitan dalam mengatur jadwal yang cocok untuk semua peserta'
      ];
    }
    
    if (hasKeyword(keywords.santri)) {
      return [
        'Perbedaan karakter dan latar belakang santri yang beragam',
        'Sebagian santri masih sulit diatur dan kurang disiplin',
        'Keterbatasan waktu untuk pembinaan yang lebih intensif',
        'Pengaruh lingkungan luar yang kurang mendukung',
        'Kurangnya dukungan dari sebagian orang tua'
      ];
    }
  }
  
  if (fieldName === 'solutions') {
    // SOLUSI - Analisa judul untuk solusi yang praktis
    if (hasKeyword(keywords.orangtua)) {
      return [
        'Menggunakan WhatsApp grup untuk komunikasi dengan orang tua',
        'Mengadakan kegiatan di hari libur agar orang tua bisa hadir',
        'Membuat perwakilan orang tua di setiap kelas',
        'Mengirimkan undangan jauh-jauh hari sebelum acara',
        'Melakukan kunjungan ke rumah orang tua secara berkala'
      ];
    }
    
    if (hasKeyword(keywords.pelatihan)) {
      return [
        'Membagi materi menjadi beberapa sesi agar tidak terlalu padat',
        'Menggunakan metode yang menarik dan mudah dipahami',
        'Menyediakan modul atau bahan ajar yang jelas',
        'Memberikan waktu istirahat yang cukup untuk peserta',
        'Melakukan pendampingan setelah pelatihan selesai'
      ];
    }
    
    if (hasKeyword(keywords.santri)) {
      return [
        'Melakukan pendekatan personal kepada setiap santri',
        'Memberikan contoh dan teladan yang baik',
        'Menerapkan sistem reward dan punishment yang jelas',
        'Melibatkan orang tua dalam pembinaan santri',
        'Membuat program pembinaan yang menarik dan menyenangkan'
      ];
    }
  }
  
  if (fieldName === 'followUpPlan') {
    // RENCANA TINDAK LANJUT - Analisa judul untuk rencana yang konkret
    if (hasKeyword(keywords.kajian) && hasKeyword(keywords.orangtua)) {
      return [
        'Mengadakan pertemuan rutin dengan orang tua setiap bulan',
        'Membuat grup WhatsApp untuk komunikasi sehari-hari',
        'Mengirimkan laporan perkembangan santri secara berkala',
        'Mengundang orang tua untuk kegiatan-kegiatan pesantren',
        'Membentuk komite orang tua untuk membantu program pesantren'
      ];
    }
    
    if (hasKeyword(keywords.pelatihan)) {
      return [
        'Melakukan pendampingan dalam penerapan hasil pelatihan',
        'Mengadakan evaluasi setelah beberapa waktu',
        'Membuat grup diskusi untuk berbagi pengalaman',
        'Menyediakan waktu konsultasi bagi yang membutuhkan',
        'Merencanakan pelatihan lanjutan untuk materi yang lebih dalam'
      ];
    }
    
    if (hasKeyword(keywords.evaluasi)) {
      return [
        'Melaksanakan perbaikan sesuai hasil evaluasi',
        'Membuat jadwal monitoring untuk memantau perkembangan',
        'Mengadakan rapat tindak lanjut untuk membahas kemajuan',
        'Menyusun laporan lengkap untuk dokumentasi',
        'Merencanakan evaluasi berikutnya untuk melihat perbaikan'
      ];
    }
  }
  
  // Jika tidak ada keyword yang cocok, return empty untuk fallback ke kategori
  return [];
}

export default AIAssistant;
