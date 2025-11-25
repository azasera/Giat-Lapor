// ============================================
// AI SERVICE - Generate Ringkasan & Rekomendasi
// ============================================

import { TahfidzSupervisionItem, SUPERVISION_CATEGORIES } from '../types/tahfidzSupervision';

interface GenerateOptions {
  teacherName: string;
  period: string;
  year: string;
  items: TahfidzSupervisionItem[];
  totalScore: number;
  percentage: number;
  category: string;
}

interface GeneratedContent {
  strengths: string;
  weaknesses: string;
  recommendations: string;
  action_plan: string;
}

// ============================================
// ANALYZE SCORES
// ============================================

const analyzeScores = (items: TahfidzSupervisionItem[]) => {
  const categoryScores: { [key: string]: { total: number; count: number; items: TahfidzSupervisionItem[] } } = {};

  items.forEach(item => {
    if (!categoryScores[item.category_name]) {
      categoryScores[item.category_name] = { total: 0, count: 0, items: [] };
    }
    categoryScores[item.category_name].total += item.score;
    categoryScores[item.category_name].count += 1;
    categoryScores[item.category_name].items.push(item);
  });

  const categoryAverages = Object.entries(categoryScores).map(([name, data]) => ({
    name,
    average: data.total / data.count,
    percentage: (data.total / (data.count * 5)) * 100,
    items: data.items
  }));

  // Sort by score
  const strongCategories = categoryAverages.filter(c => c.percentage >= 80).sort((a, b) => b.percentage - a.percentage);
  const weakCategories = categoryAverages.filter(c => c.percentage < 70).sort((a, b) => a.percentage - b.percentage);
  const needsImprovement = categoryAverages.filter(c => c.percentage >= 70 && c.percentage < 80);

  // Find specific weak indicators
  const weakIndicators = items.filter(item => item.score <= 2);
  const goodIndicators = items.filter(item => item.score >= 4);

  return {
    categoryAverages,
    strongCategories,
    weakCategories,
    needsImprovement,
    weakIndicators,
    goodIndicators
  };
};



// ============================================
// HELPER FUNCTIONS
// ============================================

const getNextPeriod = (currentPeriod: string, currentYear: string): string => {
  if (currentPeriod.toLowerCase().includes('semester 1')) {
    return `Semester 2 ${currentYear}`;
  } else if (currentPeriod.toLowerCase().includes('semester 2')) {
    return `Semester 1 ${parseInt(currentYear) + 1}`;
  } else {
    // Monthly
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const currentMonth = months.findIndex(m => currentPeriod.includes(m));
    if (currentMonth >= 0) {
      const nextMonth = (currentMonth + 3) % 12;
      const nextYear = nextMonth < currentMonth ? parseInt(currentYear) + 1 : currentYear;
      return `${months[nextMonth]} ${nextYear}`;
    }
  }
  return '3 bulan ke depan';
};

// ============================================
// CREATIVE VARIATIONS
// ============================================

const strengthVariations = [
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `${name} menunjukkan dedikasi luar biasa dengan pencapaian ${score.toFixed(1)}% (${cat}), mencerminkan komitmen tinggi dalam membimbing hafalan Al-Qur'an.`;
    if (score >= 70) return `${name} menunjukkan kinerja yang baik dengan pencapaian ${score.toFixed(1)}% (${cat}), mencerminkan usaha yang konsisten dalam mengajar.`;
    return `${name} memperoleh skor ${score.toFixed(1)}% (${cat}), menunjukkan adanya potensi yang perlu terus dikembangkan melalui pembinaan intensif.`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `Kinerja ${name} sangat membanggakan dengan skor ${score.toFixed(1)}% (${cat}), menunjukkan kualitas mengajar yang konsisten dan profesional.`;
    if (score >= 70) return `Kinerja ${name} cukup baik dengan skor ${score.toFixed(1)}% (${cat}), menunjukkan kemampuan dasar mengajar yang memadai.`;
    return `Evaluasi kinerja ${name} menghasilkan skor ${score.toFixed(1)}% (${cat}), yang mengindikasikan perlunya evaluasi mendalam terhadap metode pengajaran.`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `Sebagai guru tahfidz, ${name} memiliki kompetensi yang sangat baik (${score.toFixed(1)}% - ${cat}), menjadi teladan bagi santri dan rekan sejawat.`;
    if (score >= 70) return `Sebagai guru tahfidz, ${name} memiliki kompetensi yang cukup baik (${score.toFixed(1)}% - ${cat}), dan dapat ditingkatkan lagi dengan pelatihan.`;
    return `Hasil supervisi ${name} berada pada angka ${score.toFixed(1)}% (${cat}), menandakan perlunya pendampingan khusus untuk meningkatkan kompetensi.`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `${name} berhasil mencapai kategori ${cat} dengan skor ${score.toFixed(1)}%, membuktikan kemampuan mengajar tahfidz yang mumpuni.`;
    if (score >= 70) return `${name} mencapai kategori ${cat} dengan skor ${score.toFixed(1)}%, menunjukkan performa yang stabil namun masih bisa dioptimalkan.`;
    return `${name} berada pada kategori ${cat} dengan skor ${score.toFixed(1)}%, yang memerlukan perhatian khusus untuk perbaikan kinerja.`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `Dengan pencapaian ${score.toFixed(1)}% (${cat}), ${name} menunjukkan penguasaan yang solid dalam berbagai aspek pengajaran tahfidz.`;
    if (score >= 70) return `Dengan pencapaian ${score.toFixed(1)}% (${cat}), ${name} menunjukkan pemahaman yang cukup dalam aspek pengajaran tahfidz.`;
    return `Pencapaian ${score.toFixed(1)}% (${cat}) oleh ${name} menunjukkan bahwa masih banyak aspek dasar yang perlu diperbaiki.`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `Hasil supervisi menunjukkan ${name} memiliki kualitas mengajar yang sangat baik dengan skor ${score.toFixed(1)}% (${cat}).`;
    if (score >= 70) return `Hasil supervisi menunjukkan ${name} memiliki kualitas mengajar yang cukup baik dengan skor ${score.toFixed(1)}% (${cat}).`;
    return `Hasil supervisi menunjukkan ${name} perlu segera melakukan perbaikan kinerja, dengan skor saat ini ${score.toFixed(1)}% (${cat}).`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `Pencapaian ${name} pada kategori ${cat} (${score.toFixed(1)}%) menunjukkan profesionalisme tinggi dalam membimbing santri.`;
    if (score >= 70) return `Pencapaian ${name} pada kategori ${cat} (${score.toFixed(1)}%) menunjukkan dedikasi yang cukup baik dalam membimbing santri.`;
    return `Pencapaian ${name} pada kategori ${cat} (${score.toFixed(1)}%) mengindikasikan perlunya peningkatan kedisiplinan dan metode mengajar.`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `Evaluasi kinerja ${name} menunjukkan hasil yang memuaskan dengan perolehan ${score.toFixed(1)}% (${cat}).`;
    if (score >= 70) return `Evaluasi kinerja ${name} menunjukkan hasil yang cukup positif dengan perolehan ${score.toFixed(1)}% (${cat}).`;
    return `Evaluasi kinerja ${name} menunjukkan hasil yang belum memenuhi standar, dengan perolehan ${score.toFixed(1)}% (${cat}).`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `${name} menampilkan performa yang impresif dengan skor ${score.toFixed(1)}% pada kategori ${cat}.`;
    if (score >= 70) return `${name} menampilkan performa yang wajar dengan skor ${score.toFixed(1)}% pada kategori ${cat}.`;
    return `${name} menampilkan performa yang masih di bawah ekspektasi dengan skor ${score.toFixed(1)}% pada kategori ${cat}.`;
  },
  (name: string, score: number, cat: string) => {
    if (score >= 85) return `Kompetensi ${name} dalam mengajar tahfidz terbukti sangat baik, tercermin dari pencapaian ${score.toFixed(1)}% (${cat}).`;
    if (score >= 70) return `Kompetensi ${name} dalam mengajar tahfidz tergolong baik, tercermin dari pencapaian ${score.toFixed(1)}% (${cat}).`;
    return `Kompetensi ${name} dalam mengajar tahfidz perlu ditingkatkan secara signifikan, tercermin dari pencapaian ${score.toFixed(1)}% (${cat}).`;
  }
];

const connectingPhrases = [
  'Guru',
  'Beliau',
  'Dalam praktiknya, guru',
  'Secara khusus,',
  'Yang menonjol adalah',
  'Terlihat jelas bahwa guru',
  'Dapat diamati bahwa',
  'Perlu dicatat bahwa guru'
];

const specificPhrases = [
  'Khususnya dalam hal',
  'Terutama pada aspek',
  'Secara spesifik dalam',
  'Dengan fokus pada',
  'Terlihat jelas pada',
  'Sangat menonjol dalam',
  'Patut diapresiasi dalam hal'
];

const categoryPhrases = {
  'Kompetensi Kepribadian & Spiritual': [
    'memiliki akhlak mulia dan menjadi teladan',
    'menunjukkan kedisiplinan dan keteladanan yang baik',
    'menjaga adab dan etika mengajar Al-Qur\'an dengan sempurna',
    'konsisten dalam amalan harian dan menjadi role model'
  ],
  'Metodologi Pengajaran Tahfidz': [
    'menguasai berbagai metode tahfidz dengan baik',
    'mampu menerapkan teknik pengajaran yang efektif',
    'menggunakan pendekatan yang sistematis dan terstruktur',
    'kreatif dalam menyampaikan materi hafalan'
  ],
  'Kompetensi Linguistik Qur\'ani': [
    'memiliki bacaan Al-Qur\'an yang sangat baik',
    'menguasai tajwid dan makhraj dengan sempurna',
    'bacaan tartil yang menjadi contoh bagi santri',
    'kualitas qira\'ah yang sangat membanggakan'
  ],
  'Manajemen Kelas Tahfidz': [
    'mampu mengelola kelas dengan efektif',
    'menciptakan suasana belajar yang kondusif',
    'terampil dalam mengatur waktu pembelajaran',
    'efisien dalam mengelola dinamika kelas'
  ],
  'Pembinaan Hafalan Santri': [
    'sangat perhatian dalam membimbing hafalan',
    'konsisten dalam memantau progres santri',
    'memberikan feedback yang konstruktif',
    'peduli terhadap perkembangan setiap santri'
  ]
};

const weaknessPhrases = {
  'need_improvement': [
    'Perlu peningkatan pada',
    'Masih ada ruang perbaikan di',
    'Dapat ditingkatkan lagi dalam aspek',
    'Perlu fokus lebih pada',
    'Akan lebih baik jika ditingkatkan pada',
    'Disarankan untuk memperbaiki',
    'Perlu pengembangan lebih lanjut di',
    'Masih memerlukan peningkatan pada'
  ],
  'serious': [
    'Memerlukan perbaikan signifikan pada',
    'Perlu perhatian khusus untuk',
    'Diperlukan pembinaan intensif di',
    'Harus segera diperbaiki dalam hal',
    'Membutuhkan fokus perbaikan pada',
    'Perlu penanganan serius untuk',
    'Memerlukan intervensi pada',
    'Harus menjadi prioritas perbaikan di'
  ]
};

const improvementConnectors = [
  'Terutama dalam',
  'Khususnya pada',
  'Secara spesifik dalam',
  'Dengan fokus pada',
  'Prioritas pada',
  'Perhatian khusus untuk',
  'Fokus utama pada'
];

// ============================================
// RANDOM HELPER - True randomness
// ============================================

const getRandomInt = (seed: number, max: number): number => {
  // Use multiple hash functions for better distribution
  const hash1 = Math.sin(seed * 12.9898) * 43758.5453;
  const hash2 = Math.cos(seed * 78.233) * 23421.6312;
  const combined = (hash1 + hash2) * seed;
  return Math.floor(Math.abs(combined) % max);
};

const shuffleArray = <T>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getRandomInt(seed * (i + 1), i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const pickRandom = <T>(array: T[], seed: number, count: number = 1): T[] => {
  const shuffled = shuffleArray(array, seed);
  return shuffled.slice(0, Math.min(count, array.length));
};

// ============================================
// MAIN GENERATE FUNCTION (ENHANCED)
// ============================================

export const generateSupervisionSummary = (
  options: GenerateOptions,
  style: 'detailed' | 'concise' = 'detailed'
): GeneratedContent => {
  // Generate truly unique seeds using timestamp + random + counter
  const timestamp = Date.now();
  const random1 = Math.random() * 1000000;
  const random2 = Math.random() * 1000000;
  const random3 = Math.random() * 1000000;
  const random4 = Math.random() * 1000000;

  const seed1 = timestamp + random1 + Math.floor(Math.random() * 10000);
  const seed2 = timestamp + random2 + Math.floor(Math.random() * 20000);
  const seed3 = timestamp + random3 + Math.floor(Math.random() * 30000);
  const seed4 = timestamp + random4 + Math.floor(Math.random() * 40000);

  return {
    strengths: generateStrengthsEnhanced(options, style, seed1),
    weaknesses: generateWeaknessesEnhanced(options, style, seed2),
    recommendations: generateRecommendationsEnhanced(options, style, seed3),
    action_plan: generateActionPlanEnhanced(options, style, seed4)
  };
};

// ============================================
// ENHANCED GENERATORS
// ============================================

const generateStrengthsEnhanced = (options: GenerateOptions, style: 'detailed' | 'concise', seed: number): string => {
  const analysis = analyzeScores(options.items);
  const { strongCategories, goodIndicators, categoryAverages } = analysis;

  // Calculate data completeness
  const totalCategories = 10;
  const evaluatedCategories = categoryAverages.length;

  if (strongCategories.length === 0 && goodIndicators.length === 0) {
    const noStrengthPhrases = [
      'Perlu peningkatan di beberapa area.',
      'Masih ada ruang untuk berkembang.',
      'Fokus pada perbaikan aspek-aspek kunci.',
      'Diperlukan peningkatan di berbagai area.'
    ];
    return pickRandom(noStrengthPhrases, seed)[0];
  }

  const strengths: string[] = [];

  // Pick random variations using true randomness
  const selectedOpening = pickRandom(strengthVariations, seed)[0];
  const selectedConnector = pickRandom(connectingPhrases, seed * 1.7)[0];
  const selectedSpecific = pickRandom(specificPhrases, seed * 2.3)[0];

  if (style === 'concise') {
    // Concise - straight to the point with variation
    const conciseOpenings = [
      `Skor ${options.percentage.toFixed(0)}% (${options.category})`,
      `Pencapaian ${options.percentage.toFixed(0)}% - kategori ${options.category}`,
      `Hasil evaluasi: ${options.percentage.toFixed(0)}% (${options.category})`,
      `Performa ${options.percentage.toFixed(0)}% - ${options.category}`
    ];

    if (evaluatedCategories < 5) {
      strengths.push(`Berdasarkan ${evaluatedCategories} kategori: ${pickRandom(conciseOpenings, seed)[0]}.`);
    } else {
      strengths.push(`${pickRandom(conciseOpenings, seed)[0]}.`);
    }

    if (strongCategories.length > 0) {
      const selectedCategories = pickRandom(strongCategories, seed * 3.1, 2);
      selectedCategories.forEach(cat => {
        const phrases = categoryPhrases[cat.name as keyof typeof categoryPhrases] || ['unggul'];
        const selectedPhrase = pickRandom(phrases, seed * cat.percentage)[0];
        strengths.push(`${cat.name}: ${selectedPhrase}.`);
      });
    }
  } else {
    // Detailed - comprehensive analysis with TRUE variation
    if (evaluatedCategories < 5) {
      // Limited data - multiple opening variations
      const limitedOpenings = [
        `Berdasarkan penilaian pada ${evaluatedCategories} dari ${totalCategories} kategori supervisi, ${options.teacherName} menunjukkan kinerja yang ${options.percentage >= 80 ? 'baik' : 'cukup'} dengan skor ${options.percentage.toFixed(1)}% (${options.category}).`,
        `Dari ${evaluatedCategories} kategori yang dievaluasi, ${options.teacherName} meraih skor ${options.percentage.toFixed(1)}% (${options.category}), menunjukkan performa yang ${options.percentage >= 80 ? 'memuaskan' : 'perlu ditingkatkan'}.`,
        `Evaluasi terhadap ${evaluatedCategories} kategori menunjukkan ${options.teacherName} memperoleh ${options.percentage.toFixed(1)}% (${options.category}), mencerminkan kinerja yang ${options.percentage >= 80 ? 'positif' : 'memerlukan perbaikan'}.`,
        `Hasil penilaian ${evaluatedCategories} kategori: ${options.teacherName} mencapai ${options.percentage.toFixed(1)}% dengan kategori ${options.category}, menandakan performa yang ${options.percentage >= 80 ? 'baik' : 'cukup'}.`
      ];
      strengths.push(pickRandom(limitedOpenings, seed)[0]);

      if (strongCategories.length > 0) {
        const selectedCats = pickRandom(strongCategories, seed * 4.7, Math.min(2, strongCategories.length));
        const categoryNames = selectedCats.map(c => c.name).join(' dan ');

        const aspectPhrases = [
          `Pada aspek ${categoryNames}, guru menunjukkan kompetensi yang memuaskan`,
          `Dalam ${categoryNames}, terlihat penguasaan yang baik`,
          `Khususnya di ${categoryNames}, guru memiliki kekuatan yang jelas`,
          `Untuk ${categoryNames}, performa guru cukup solid`
        ];
        strengths.push(pickRandom(aspectPhrases, seed * 5.3)[0] + '.');

        // Add descriptive phrases with TRUE randomness
        const descriptions: string[] = [];
        selectedCats.forEach((cat, idx) => {
          const phrases = categoryPhrases[cat.name as keyof typeof categoryPhrases];
          if (phrases) {
            descriptions.push(pickRandom(phrases, seed * (idx + 7.9))[0]);
          }
        });

        if (descriptions.length > 0) {
          strengths.push(`${selectedConnector} ${descriptions.join(', dan ')}.`);
        }
      }

      if (goodIndicators.length > 0) {
        const selectedIndicators = pickRandom(goodIndicators, seed * 6.1, 2);
        const examples = selectedIndicators.map(i => i.indicator_text.toLowerCase()).join(' serta ');
        strengths.push(`${selectedSpecific} ${examples}.`);
      }

      const closingPhrases = [
        `Untuk evaluasi yang lebih komprehensif, disarankan melengkapi penilaian pada ${totalCategories - evaluatedCategories} kategori lainnya.`,
        `Penilaian akan lebih lengkap jika ${totalCategories - evaluatedCategories} kategori lainnya turut dievaluasi.`,
        `Disarankan melengkapi ${totalCategories - evaluatedCategories} kategori tersisa untuk analisis yang lebih menyeluruh.`
      ];
      strengths.push(pickRandom(closingPhrases, seed * 8.7)[0]);
    } else {
      // Comprehensive data - MAXIMUM variation
      strengths.push(selectedOpening(options.teacherName, options.percentage, options.category));

      // Strong categories with DYNAMIC selection
      if (strongCategories.length > 0) {
        const selectedTop = pickRandom(strongCategories, seed * 9.3, Math.min(2, strongCategories.length));
        const categoryNames = selectedTop.map(c => c.name).join(' dan ');

        const excellenceWords = [
          'Sangat unggul', 'Menonjol', 'Berkinerja cemerlang', 'Menunjukkan keunggulan',
          'Memiliki kelebihan', 'Sangat kompeten', 'Berprestasi baik', 'Menampilkan kualitas tinggi',
          'Unggul secara konsisten', 'Memiliki keahlian solid', 'Menguasai dengan baik', 'Berprestasi menonjol'
        ];
        const selectedExcellence = pickRandom(excellenceWords, seed * 10.1)[0];

        const categoryIntros = [
          `${selectedExcellence} dalam ${categoryNames}`,
          `Untuk ${categoryNames}, ${options.teacherName.split(' ')[0]} ${selectedExcellence.toLowerCase()}`,
          `Di bidang ${categoryNames}, menunjukkan ${selectedExcellence.toLowerCase()}`,
          `${categoryNames} menjadi kekuatan utama dengan ${selectedExcellence.toLowerCase()}`
        ];
        strengths.push(pickRandom(categoryIntros, seed * 11.7)[0] + '.');

        // Add specific descriptive phrases with COMPLETE randomness
        const descriptions: string[] = [];
        selectedTop.forEach((cat, idx) => {
          const phrases = categoryPhrases[cat.name as keyof typeof categoryPhrases];
          if (phrases) {
            descriptions.push(pickRandom(phrases, seed * (idx + 12.3))[0]);
          }
        });

        if (descriptions.length > 0) {
          const descIntros = [
            `${selectedConnector} ${descriptions.join(', dan ')}`,
            `Terlihat dari ${descriptions.join(', serta ')}`,
            `Ditunjukkan melalui ${descriptions.join(', dan juga ')}`,
            `Hal ini tercermin dalam ${descriptions.join(', dan ')}`
          ];
          strengths.push(pickRandom(descIntros, seed * 13.9)[0] + '.');
        }
      }

      // Specific good indicators - VARIED selection
      if (goodIndicators.length > 0) {
        const selectedGood = pickRandom(goodIndicators, seed * 14.7, Math.min(2, goodIndicators.length));
        const examples = selectedGood.map(i => i.indicator_text.toLowerCase()).join(' serta ');

        const exampleIntros = [
          `${selectedSpecific} ${examples}`,
          `Contohnya dalam ${examples}`,
          `Terutama terlihat pada ${examples}`,
          `Khususnya dalam hal ${examples}`
        ];
        strengths.push(pickRandom(exampleIntros, seed * 15.3)[0] + '.');
      }

      // Add closing statement with MAXIMUM variety
      if (evaluatedCategories >= 8) {
        let closingStatements: string[] = [];

        if (options.percentage >= 85) {
          closingStatements = [
            'Secara keseluruhan menunjukkan dedikasi yang konsisten.',
            'Performa yang ditunjukkan mencerminkan profesionalisme tinggi.',
            'Kualitas mengajar yang stabil dan dapat diandalkan.',
            'Komitmen dalam membimbing santri sangat terpuji.',
            'Menunjukkan konsistensi dalam berbagai aspek pengajaran.',
            'Kinerja yang solid dan patut dipertahankan.',
            'Dedikasi terhadap pengembangan santri sangat baik.',
            'Profesionalisme yang ditunjukkan layak diapresiasi.',
            'Performa keseluruhan mencerminkan kompetensi yang mumpuni.',
            'Kualitas kerja yang ditampilkan sangat memuaskan.',
            'Menunjukkan integritas dan dedikasi yang tinggi.',
            'Komitmen terhadap kualitas pembelajaran sangat baik.'
          ];
        } else if (options.percentage >= 70) {
          closingStatements = [
            'Secara umum kinerja sudah cukup baik namun masih ada ruang untuk perbaikan.',
            'Konsistensi perlu dijaga untuk mencapai hasil yang lebih optimal.',
            'Performa cukup stabil, namun perlu peningkatan di beberapa aspek.',
            'Menunjukkan potensi yang baik untuk dikembangkan lebih lanjut.',
            'Kinerja yang ditampilkan sudah memenuhi standar dasar.',
            'Perlu upaya lebih untuk mencapai level kompetensi yang lebih tinggi.',
            'Secara garis besar sudah baik, dengan beberapa catatan perbaikan.',
            'Diharapkan dapat terus meningkatkan kualitas pengajaran.'
          ];
        } else {
          closingStatements = [
            'Diperlukan upaya serius untuk meningkatkan kualitas pengajaran secara menyeluruh.',
            'Perlu evaluasi mendalam dan perbaikan signifikan di berbagai aspek.',
            'Fokus pada perbaikan dasar sangat diperlukan saat ini.',
            'Kinerja saat ini memerlukan perhatian khusus dan pembinaan intensif.',
            'Diharapkan segera melakukan perbaikan kinerja sesuai rekomendasi.',
            'Perlu komitmen lebih kuat untuk meningkatkan standar pengajaran.',
            'Memerlukan pendampingan intensif untuk mencapai standar yang diharapkan.',
            'Peningkatan kompetensi harus menjadi prioritas utama saat ini.'
          ];
        }
        strengths.push(pickRandom(closingStatements, seed * 16.9)[0]);
      }
    }
  }

  return strengths.join(' ');
};

const generateWeaknessesEnhanced = (options: GenerateOptions, style: 'detailed' | 'concise', seed: number): string => {
  const analysis = analyzeScores(options.items);
  const { weakCategories, needsImprovement } = analysis;

  if (weakCategories.length === 0 && needsImprovement.length === 0) {
    const goodPhrases = [
      'Sudah baik, pertahankan.',
      'Kinerja sudah baik. Pertahankan konsistensi.',
      'Pada aspek yang dinilai, performa sudah memuaskan.',
      'Tidak ada kelemahan signifikan yang teridentifikasi.',
      'Secara umum sudah baik, terus tingkatkan.',
      'Performa solid di semua aspek yang dinilai.'
    ];
    return pickRandom(goodPhrases, seed)[0];
  }

  const weaknesses: string[] = [];
  const phraseType = weakCategories.length > 0 ? 'serious' : 'need_improvement';
  const phrases = weaknessPhrases[phraseType];
  const selectedPhrase = pickRandom(phrases, seed)[0];

  if (style === 'concise') {
    const allWeak = [...weakCategories, ...needsImprovement];
    if (allWeak.length > 0) {
      const selected = pickRandom(allWeak, seed, Math.min(2, allWeak.length));
      const categoryNames = selected.map(c => c.name).join(', ');
      weaknesses.push(`${selectedPhrase}: ${categoryNames}.`);
    }
  } else {
    // Weak categories with TRUE variation
    if (weakCategories.length > 0) {
      const selectedWeak = pickRandom(weakCategories, seed * 17.9, weakCategories.length);
      const categoryNames = selectedWeak.map(c => `${c.name} (${c.percentage.toFixed(0)}%)`).join(', ');

      const openings = [
        `${selectedPhrase} ${categoryNames}`,
        `Terdapat kelemahan pada ${categoryNames}`,
        `Area yang memerlukan perhatian: ${categoryNames}`,
        `Aspek yang perlu ditingkatkan meliputi ${categoryNames}`
      ];
      weaknesses.push(pickRandom(openings, seed * 19.3)[0] + '.');

      // Add specific issues with COMPLETE randomness
      const issues: string[] = [];
      const selectedCats = pickRandom(selectedWeak, seed * 21.7, Math.min(2, selectedWeak.length));

      selectedCats.forEach(cat => {
        const lowItems = cat.items.filter(item => item.score <= 2);
        if (lowItems.length > 0) {
          const selectedItem = pickRandom(lowItems, seed * cat.percentage)[0];
          issues.push(selectedItem.indicator_text.toLowerCase());
        }
      });

      if (issues.length > 0) {
        const selectedConnector = pickRandom(improvementConnectors, seed * 23.1)[0];
        const issueIntros = [
          `${selectedConnector} ${issues.join(' dan ')}`,
          `Terutama dalam ${issues.join(' serta ')}`,
          `Khususnya terkait ${issues.join(' dan ')}`,
          `Fokus perbaikan pada ${issues.join(' dan juga ')}`
        ];
        weaknesses.push(pickRandom(issueIntros, seed * 25.9)[0] + '.');
      }
    }

    // Needs improvement with variation
    if (needsImprovement.length > 0 && weakCategories.length === 0) {
      const selected = pickRandom(needsImprovement, seed * 27.3, Math.min(2, needsImprovement.length));
      const categoryNames = selected.map(c => c.name).join(' dan ');

      const improvementPhrases = [
        'untuk mencapai hasil yang lebih optimal',
        'agar performa semakin meningkat',
        'untuk mencapai kategori yang lebih tinggi',
        'supaya kualitas mengajar lebih maksimal',
        'demi peningkatan kualitas pembelajaran',
        'guna mencapai standar yang lebih baik',
        'untuk meningkatkan efektivitas mengajar',
        'agar hasil pembelajaran lebih maksimal'
      ];
      const selectedImprovement = pickRandom(improvementPhrases, seed * 29.7)[0];

      const templates = [
        `${selectedPhrase} ${categoryNames} ${selectedImprovement}`,
        `Untuk ${categoryNames}, diperlukan peningkatan ${selectedImprovement}`,
        `${categoryNames} perlu ditingkatkan ${selectedImprovement}`,
        `Fokus pada ${categoryNames} ${selectedImprovement}`
      ];
      weaknesses.push(pickRandom(templates, seed * 31.1)[0] + '.');
    }
  }

  return weaknesses.join(' ');
};

const generateRecommendationsEnhanced = (options: GenerateOptions, style: 'detailed' | 'concise', seed: number): string => {
  const analysis = analyzeScores(options.items);
  const { weakCategories, needsImprovement } = analysis;

  const recommendations: string[] = [];
  const recTemplates = [
    'Disarankan untuk',
    'Sebaiknya',
    'Perlu',
    'Direkomendasikan agar',
    'Akan lebih baik jika',
    'Sangat dianjurkan untuk',
    'Penting untuk',
    'Hendaknya',
    'Diperlukan untuk',
    'Baik jika',
    'Diharapkan dapat',
    'Perlu dipertimbangkan untuk',
    'Sangat baik jika',
    'Disarankan agar',
    'Perlu kiranya',
    'Akan optimal jika'
  ];

  const performanceTemplates = [
    'Pertahankan kualitas',
    'Jaga konsistensi',
    'Maintain performa',
    'Terus tingkatkan kualitas',
    'Lanjutkan dedikasi',
    'Teruskan prestasi',
    'Pertahankan standar',
    'Jaga momentum positif',
    'Terus kembangkan kemampuan',
    'Pertahankan dan tingkatkan',
    'Jaga performa positif',
    'Lanjutkan komitmen'
  ];

  // Performance-based recommendation with VARIATION
  if (options.percentage >= 90) {
    const excellentRecs = style === 'concise' ? [
      'Pertahankan kualitas, jadilah mentor.',
      'Terus berprestasi, bimbing rekan lain.',
      'Maintain performa, share best practice.',
      'Jaga standar tinggi, jadilah role model.'
    ] : [
      'Pertahankan kualitas mengajar yang luar biasa ini dan jadilah mentor bagi guru-guru lain.',
      'Terus tingkatkan prestasi cemerlang ini dan berbagi best practice dengan rekan sejawat.',
      'Jaga konsistensi performa excellent ini dan menjadi role model bagi tim pengajar.',
      'Maintain standar tinggi yang telah dicapai dan berperan sebagai pembimbing guru lain.',
      'Pertahankan dedikasi luar biasa ini dan aktif dalam mentoring rekan-rekan guru.'
    ];
    recommendations.push(pickRandom(excellentRecs, seed)[0]);
  } else if (options.percentage >= 80) {
    const goodRecs = style === 'concise' ? [
      'Tingkatkan beberapa aspek untuk mencapai Mumtaz.',
      'Fokus perbaikan menuju kategori Mumtaz.',
      'Optimalkan area tertentu untuk Mumtaz.',
      'Perbaiki aspek kunci menuju excellent.'
    ] : [
      'Tingkatkan beberapa aspek untuk mencapai kategori Mumtaz (90%+) pada supervisi berikutnya.',
      'Fokus pada perbaikan area tertentu untuk meraih kategori Mumtaz di evaluasi mendatang.',
      'Optimalkan beberapa aspek kunci agar dapat mencapai level Mumtaz pada periode berikutnya.',
      'Perbaiki area yang masih perlu ditingkatkan untuk meraih kategori excellent (Mumtaz).',
      'Tingkatkan konsistensi di semua aspek untuk mencapai standar Mumtaz.'
    ];
    recommendations.push(pickRandom(goodRecs, seed)[0]);
  } else if (options.percentage >= 70) {
    const fairRecs = style === 'concise' ? [
      'Fokus perbaikan area lemah.',
      'Prioritas peningkatan aspek kunci.',
      'Perbaiki area yang lemah segera.',
      'Tingkatkan aspek yang kurang.'
    ] : [
      'Fokus pada perbaikan area yang lemah melalui pelatihan dan pembinaan.',
      'Prioritaskan peningkatan aspek-aspek kunci yang masih perlu dikembangkan.',
      'Perbaiki area lemah dengan mengikuti program pengembangan kompetensi.',
      'Tingkatkan aspek yang kurang melalui training dan mentoring intensif.',
      'Fokus pada pengembangan area yang memerlukan perbaikan signifikan.'
    ];
    recommendations.push(pickRandom(fairRecs, seed)[0]);
  } else {
    const needsImprovementRecs = style === 'concise' ? [
      'Perlu pembinaan intensif.',
      'Diperlukan pendampingan khusus.',
      'Butuh coaching intensif segera.',
      'Perlu program perbaikan menyeluruh.'
    ] : [
      'Diperlukan pembinaan intensif dan pendampingan dari guru senior.',
      'Perlu program coaching khusus dan mentoring berkelanjutan.',
      'Butuh pendampingan intensif dari supervisor dan guru berpengalaman.',
      'Diperlukan program perbaikan menyeluruh dengan bimbingan khusus.',
      'Perlu pembinaan komprehensif dan monitoring ketat dari manajemen.'
    ];
    recommendations.push(pickRandom(needsImprovementRecs, seed)[0]);
  }

  // Specific recommendations with MAXIMUM variety
  const allWeak = pickRandom([...weakCategories, ...needsImprovement], seed * 33.7, style === 'concise' ? 2 : 3);

  allWeak.forEach((cat, idx) => {
    const recMap: { [key: string]: string[] } = {
      'Kepribadian': [
        'tingkatkan kedisiplinan dan keteladanan',
        'perbaiki manajemen waktu dan kehadiran',
        'perkuat komitmen spiritual dan akhlak',
        'jadilah role model yang lebih baik',
        'tingkatkan integritas dan konsistensi',
        'perbaiki etika dan adab mengajar'
      ],
      'Metodologi': [
        'ikuti pelatihan metode tahfidz modern',
        'pelajari variasi teknik pengajaran',
        'eksplorasi metode pembelajaran inovatif',
        'terapkan pendekatan yang lebih kreatif',
        'ikuti workshop pedagogi tahfidz',
        'pelajari best practice dari guru senior'
      ],
      'Linguistik': [
        'ikuti kursus tajwid dan qira\'at',
        'latihan makhraj dengan guru senior',
        'tingkatkan kualitas bacaan Al-Qur\'an',
        'perbaiki penguasaan ilmu tajwid',
        'bergabung dengan halaqah tahsin',
        'latihan rutin dengan ahli qira\'at'
      ],
      'Manajemen': [
        'ikuti workshop manajemen kelas',
        'pelajari time management',
        'optimalkan pengelolaan waktu pembelajaran',
        'tingkatkan efektivitas manajemen kelas',
        'terapkan strategi classroom management',
        'perbaiki sistem pengelolaan kelas'
      ],
      'Pembinaan': [
        'tingkatkan frekuensi muraja\'ah',
        'berikan feedback lebih detail',
        'perkuat pendampingan individual santri',
        'tingkatkan monitoring progres hafalan',
        'optimalkan sistem pembinaan hafalan',
        'perbaiki metode tracking progres'
      ],
      'Penilaian': [
        'lengkapi sistem pencatatan',
        'buat buku mutaba\'ah terstruktur',
        'terapkan sistem evaluasi yang lebih baik',
        'dokumentasikan progres dengan lebih rapi',
        'gunakan tools assessment yang efektif',
        'perbaiki sistem dokumentasi evaluasi'
      ],
      'Komunikasi': [
        'bangun komunikasi dengan orang tua',
        'buat laporan berkala',
        'tingkatkan koordinasi dengan wali santri',
        'perkuat komunikasi dua arah',
        'optimalkan interaksi dengan stakeholder',
        'perbaiki sistem pelaporan progres'
      ],
      'Motivasi': [
        'berikan motivasi ruhiyah rutin',
        'tanamkan adab Al-Qur\'an',
        'tingkatkan pembinaan mental spiritual',
        'berikan dorongan positif lebih sering',
        'perkuat aspek motivasi pembelajaran',
        'tingkatkan inspirasi dan semangat santri'
      ],
      'Setoran': [
        'tingkatkan fokus saat menyimak',
        'berikan koreksi lebih detail',
        'perbaiki kualitas simakan hafalan',
        'tingkatkan ketelitian dalam mengoreksi',
        'optimalkan proses penerimaan setoran',
        'perbaiki metode evaluasi hafalan'
      ],
      'Profesionalisme': [
        'tingkatkan kehadiran rapat',
        'tunjukkan komitmen lebih',
        'perkuat dedikasi profesional',
        'tingkatkan partisipasi aktif',
        'perbaiki work ethic dan disiplin',
        'tingkatkan kontribusi dalam tim'
      ]
    };

    for (const [key, recs] of Object.entries(recMap)) {
      if (cat.name.includes(key)) {
        const selectedRec = pickRandom(recs, seed * (idx + 37.9))[0];
        const selectedTemplate = pickRandom(recTemplates, seed * (idx + 41.3))[0];

        if (style === 'concise') {
          recommendations.push(selectedRec);
        } else {
          const formats = [
            `${selectedTemplate} ${selectedRec}`,
            `Untuk ${cat.name}, ${selectedTemplate.toLowerCase()} ${selectedRec}`,
            `Terkait ${cat.name}, ${selectedRec}`,
            `${cat.name}: ${selectedTemplate.toLowerCase()} ${selectedRec}`
          ];
          recommendations.push(pickRandom(formats, seed * (idx + 43.7))[0] + '.');
        }
        break;
      }
    }
  });

  return recommendations.join(style === 'concise' ? '; ' : ' ');
};

const generateActionPlanEnhanced = (options: GenerateOptions, style: 'detailed' | 'concise', seed: number): string => {
  const analysis = analyzeScores(options.items);
  const { weakCategories, needsImprovement } = analysis;

  if (style === 'concise') {
    const actions: string[] = [];
    const phase1Options = [
      'Bulan 1: Pelatihan & observasi',
      'Bulan 1: Workshop & mentoring',
      'Bulan 1: Kursus & pendampingan',
      'Bulan 1: Training & coaching'
    ];
    const phase2Options = [
      'Bulan 2-3: Implementasi perbaikan',
      'Bulan 2-3: Penerapan hasil training',
      'Bulan 2-3: Praktik & evaluasi',
      'Bulan 2-3: Eksekusi rencana'
    ];
    const phase3Options = [
      'Bulan 4-6: Evaluasi & follow-up',
      'Bulan 4-6: Monitoring & penyesuaian',
      'Bulan 4-6: Review & improvement',
      'Bulan 4-6: Assessment & refinement'
    ];

    actions.push(phase1Options[Math.floor((seed * 47.3) % phase1Options.length)]);
    actions.push(phase2Options[Math.floor((seed * 53.7) % phase2Options.length)]);
    actions.push(phase3Options[Math.floor((seed * 59.1) % phase3Options.length)]);

    const targetPercentage = Math.min(options.percentage + 15, 95);
    actions.push(`Target: ${targetPercentage.toFixed(0)}% pada supervisi berikutnya`);
    return actions.join('. ');
  }

  const actions: string[] = [];
  let actionNumber = 1;

  actions.push('**Rencana Tindak Lanjut:**\n');
  actions.push('**Bulan 1 (Immediate):**');

  const startIdx = Math.floor((seed * 61.9) % Math.max(1, [...weakCategories, ...needsImprovement].length));
  const allWeak = [...weakCategories, ...needsImprovement].slice(startIdx, startIdx + 3);

  const actionMap: { [key: string]: string[] } = {
    'Linguistik': [
      'Daftarkan ke kursus tajwid intensif',
      'Ikuti pelatihan qira\'at dengan ahli',
      'Latihan makhraj bersama guru senior',
      'Bergabung dengan halaqah tahsin'
    ],
    'Metodologi': [
      'Observasi guru senior (minimal 3x)',
      'Ikuti workshop metode tahfidz',
      'Pelajari teknik pengajaran inovatif',
      'Terapkan metode pembelajaran baru'
    ],
    'Manajemen': [
      'Ikuti workshop manajemen kelas',
      'Pelajari time management efektif',
      'Terapkan sistem pengelolaan kelas',
      'Optimalkan strategi classroom management'
    ],
    'Kepribadian': [
      'Ikuti pembinaan akhlak dan adab',
      'Tingkatkan kedisiplinan pribadi',
      'Perkuat komitmen spiritual',
      'Bergabung dengan mentoring guru'
    ],
    'Pembinaan': [
      'Tingkatkan frekuensi muraja\'ah',
      'Perbaiki sistem monitoring santri',
      'Terapkan pendampingan individual',
      'Optimalkan pembinaan hafalan'
    ]
  };

  allWeak.forEach((cat, idx) => {
    for (const [key, actionList] of Object.entries(actionMap)) {
      if (cat.name.includes(key)) {
        const actionIdx = Math.floor((seed * (idx + 13.3)) % actionList.length);
        actions.push(`${actionNumber}. ${actionList[actionIdx]}`);
        actionNumber++;
        break;
      }
    }
  });

  const shortTermOptions = [
    ['Implementasi hasil pelatihan', 'Monitoring progress mingguan'],
    ['Terapkan pembelajaran baru', 'Evaluasi berkala dengan supervisor'],
    ['Praktikkan skill yang dipelajari', 'Review progress setiap minggu'],
    ['Eksekusi rencana perbaikan', 'Tracking kemajuan rutin']
  ];
  const shortTermIdx = Math.floor((seed * 67.7) % shortTermOptions.length);

  actions.push('\n**Bulan 2-3 (Short Term):**');
  shortTermOptions[shortTermIdx].forEach(action => {
    actions.push(`${actionNumber}. ${action}`);
    actionNumber++;
  });

  const longTermOptions = [
    ['Evaluasi progress dan penyesuaian', 'Supervisi lanjutan'],
    ['Review hasil implementasi', 'Follow-up dan refinement'],
    ['Assessment komprehensif', 'Penyempurnaan metode'],
    ['Analisis pencapaian', 'Continuous improvement']
  ];
  const longTermIdx = Math.floor((seed * 71.3) % longTermOptions.length);

  actions.push('\n**Bulan 4-6 (Long Term):**');
  longTermOptions[longTermIdx].forEach(action => {
    actions.push(`${actionNumber}. ${action}`);
    actionNumber++;
  });

  const targetPercentage = Math.min(options.percentage + 15, 95);
  const nextPeriod = getNextPeriod(options.period, options.year);
  actions.push(`\n**Target:** Mencapai minimal ${targetPercentage.toFixed(0)}% pada ${nextPeriod}.`);

  return actions.join('\n');
};

// ============================================
// ALTERNATIVE: OpenAI Integration (Optional)
// ============================================

export const generateWithOpenAI = async (
  options: GenerateOptions,
  apiKey?: string,
  style: 'detailed' | 'concise' = 'detailed'
): Promise<GeneratedContent> => {
  if (!apiKey) {
    // Fallback to rule-based generation
    return generateSupervisionSummary(options);
  }

  try {
    const analysis = analyzeScores(options.items);

    // Style-specific instructions
    const styleInstructions = style === 'concise'
      ? 'Gunakan bahasa yang SINGKAT dan PADAT. Maksimal 1-2 kalimat per bagian. Langsung ke poin penting.'
      : 'Gunakan bahasa yang DETAIL dan LENGKAP. Berikan analisis mendalam dengan contoh konkret.';

    const lengthGuide = style === 'concise'
      ? 'strengths: 1-2 kalimat, weaknesses: 1-2 kalimat, recommendations: 2-3 poin singkat, action_plan: 3-4 poin timeline'
      : 'strengths: 2-3 kalimat detail, weaknesses: 2-3 kalimat detail, recommendations: 4-6 poin lengkap, action_plan: 6-8 poin dengan timeline detail';

    const prompt = `Anda adalah supervisor guru tahfidz yang berpengalaman. Berdasarkan data supervisi berikut, buatkan analisis lengkap:

Guru: ${options.teacherName}
Periode: ${options.period} ${options.year}
Skor Total: ${options.totalScore}/${options.items.length * 5} (${options.percentage.toFixed(1)}%)
Kategori: ${options.category}

Kategori Kuat: ${analysis.strongCategories.map(c => `${c.name} (${c.percentage.toFixed(0)}%)`).join(', ') || 'Tidak ada'}
Kategori Lemah: ${analysis.weakCategories.map(c => `${c.name} (${c.percentage.toFixed(0)}%)`).join(', ') || 'Tidak ada'}

STYLE: ${style === 'concise' ? 'SINGKAT & PADAT' : 'DETAIL & LENGKAP'}
${styleInstructions}

Buatkan dalam format JSON (${lengthGuide}):
{
  "strengths": "Kekuatan guru",
  "weaknesses": "Area yang perlu diperbaiki",
  "recommendations": "Rekomendasi konkret",
  "action_plan": "Rencana tindak lanjut dengan timeline"
}

PENTING: 
- Gunakan bahasa Indonesia yang profesional dan konstruktif
- Setiap kali generate, berikan VARIASI kata dan sudut pandang yang BERBEDA
- Jangan gunakan template yang sama, be CREATIVE!
- Fokus pada aspek yang berbeda setiap kali generate`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Anda adalah supervisor guru tahfidz yang berpengalaman dan kreatif. Setiap analisis harus unik dan bervariasi.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9, // Higher temperature for more variation
        max_tokens: style === 'concise' ? 600 : 1200,
        presence_penalty: 0.6, // Encourage new topics
        frequency_penalty: 0.6 // Reduce repetition
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return generateSupervisionSummary(options);
  } catch (error) {
    console.error('Error generating with OpenAI:', error);
    // Fallback to rule-based generation
    return generateSupervisionSummary(options);
  }
};


// ============================================
// AI RECOMMEND FOCUS AREAS
// ============================================

interface FocusAreaRecommendation {
  focusAreas: string[];
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export const recommendFocusAreas = (
  previousSupervisions: any[]
): FocusAreaRecommendation => {
  // If no previous data, return general recommendation
  if (!previousSupervisions || previousSupervisions.length === 0) {
    return {
      focusAreas: [
        'Evaluasi Umum Semua Aspek',
        'Penilaian Kondisi Awal',
        'Identifikasi Kekuatan dan Kelemahan'
      ],
      reasoning: 'Belum ada data supervisi sebelumnya. Rekomendasi: Lakukan evaluasi menyeluruh untuk mendapatkan data kondisi awal sebagai acuan.',
      priority: 'high'
    };
  }

  // Analyze latest supervision
  const latestSupervision = previousSupervisions[0];
  const allItems: TahfidzSupervisionItem[] = [];

  // Collect all items from previous supervisions
  previousSupervisions.forEach(sup => {
    if (sup.items) {
      allItems.push(...sup.items);
    }
  });

  if (allItems.length === 0) {
    return {
      focusAreas: [
        'Metodologi Pengajaran Tahfidz',
        'Kompetensi Linguistik Qur\'ani',
        'Manajemen Kelas Tahfidz'
      ],
      reasoning: 'Data penilaian detail tidak tersedia. Rekomendasi: Fokus pada aspek-aspek fundamental pengajaran tahfidz.',
      priority: 'medium'
    };
  }

  // Analyze scores
  const analysis = analyzeScores(allItems);
  const { weakCategories, needsImprovement, categoryAverages } = analysis;

  // Determine focus areas based on weak categories
  const focusAreas: string[] = [];
  let reasoning = '';
  let priority: 'high' | 'medium' | 'low' = 'medium';

  // Priority 1: Critical weak areas (< 60%)
  const criticalAreas = categoryAverages.filter(c => c.percentage < 60);
  if (criticalAreas.length > 0) {
    priority = 'high';
    criticalAreas.slice(0, 3).forEach(cat => {
      focusAreas.push(mapCategoryToFocusArea(cat.name, cat.items));
    });
    reasoning = `Ditemukan ${criticalAreas.length} area kritis dengan skor < 60%. Prioritas tinggi untuk perbaikan segera pada: ${criticalAreas.map(c => c.name).join(', ')}.`;
  }
  // Priority 2: Weak areas (60-70%)
  else if (weakCategories.length > 0) {
    priority = 'high';
    weakCategories.slice(0, 3).forEach(cat => {
      focusAreas.push(mapCategoryToFocusArea(cat.name, cat.items));
    });
    reasoning = `Ditemukan ${weakCategories.length} area yang perlu perbaikan (skor 60-70%). Fokus pada: ${weakCategories.map(c => c.name).join(', ')}.`;
  }
  // Priority 3: Areas needing improvement (70-80%)
  else if (needsImprovement.length > 0) {
    priority = 'medium';
    needsImprovement.slice(0, 3).forEach(cat => {
      focusAreas.push(mapCategoryToFocusArea(cat.name, cat.items));
    });
    reasoning = `Performa baik secara keseluruhan. Fokus pada peningkatan area yang masih bisa dioptimalkan (skor 70-80%): ${needsImprovement.map(c => c.name).join(', ')}.`;
  }
  // All areas are strong
  else {
    priority = 'low';
    // Focus on maintaining excellence and specific improvements
    const topAreas = categoryAverages.sort((a, b) => a.percentage - b.percentage).slice(0, 3);
    topAreas.forEach(cat => {
      focusAreas.push(mapCategoryToFocusArea(cat.name, cat.items));
    });
    reasoning = `Performa excellent di semua area (skor > 80%). Fokus pada: Mempertahankan kualitas dan peningkatan berkelanjutan pada area dengan skor terendah relatif.`;
  }

  // Ensure we have 3 focus areas
  if (focusAreas.length < 3) {
    const additionalAreas = getAdditionalFocusAreas(categoryAverages, focusAreas);
    focusAreas.push(...additionalAreas.slice(0, 3 - focusAreas.length));
  }

  return {
    focusAreas: focusAreas.slice(0, 3),
    reasoning,
    priority
  };
};

// Map category to specific focus area
const mapCategoryToFocusArea = (categoryName: string, items: TahfidzSupervisionItem[]): string => {
  // Find the weakest indicator in this category
  const sortedItems = items.sort((a, b) => a.score - b.score);
  const weakestItem = sortedItems[0];

  const focusMap: { [key: string]: { [key: string]: string } } = {
    'Kompetensi Kepribadian & Spiritual': {
      'default': 'Keteladanan Akhlak dan Spiritual',
      'Memiliki akhlak mulia': 'Pembinaan Akhlak Guru',
      'Disiplin dalam kehadiran': 'Kedisiplinan dan Ketepatan Waktu',
      'Menjadi teladan': 'Keteladanan dalam Mengajar',
      'Menjaga adab': 'Adab Mengajar Al-Qur\'an',
      'Konsisten dalam amalan': 'Konsistensi Amalan Harian'
    },
    'Metodologi Pengajaran Tahfidz': {
      'default': 'Metode Pengajaran Tahfidz',
      'Menguasai berbagai metode': 'Variasi Metode Talaqqi',
      'Mampu menerapkan teknik': 'Teknik Muraja\'ah Efektif',
      'Menggunakan pendekatan': 'Pendekatan Pembelajaran Inovatif',
      'Kreatif dalam menyampaikan': 'Kreativitas Penyampaian Materi',
      'Metode yang digunakan efektif': 'Efektivitas Metode Pengajaran'
    },
    'Kompetensi Linguistik Qur\'ani': {
      'default': 'Kualitas Bacaan dan Tajwid',
      'Memiliki bacaan': 'Kualitas Bacaan Al-Qur\'an',
      'Menguasai tajwid': 'Penguasaan Ilmu Tajwid',
      'Makhraj huruf': 'Makhraj Huruf yang Benar',
      'Bacaan tartil': 'Tartil dan Kelancaran Bacaan',
      'Kualitas qira\'ah': 'Kualitas Qira\'ah dan Lagu'
    },
    'Manajemen Kelas Tahfidz': {
      'default': 'Manajemen Kelas Efektif',
      'Mampu mengelola kelas': 'Pengelolaan Kelas yang Baik',
      'Mengatur waktu': 'Time Management Pembelajaran',
      'Pengaturan tempat duduk': 'Pengaturan Ruang Kelas',
      'Menjaga kedisiplinan': 'Disiplin dan Kondusivitas Kelas',
      'Menciptakan suasana': 'Suasana Belajar Kondusif'
    },
    'Pembinaan Hafalan Santri': {
      'default': 'Pembinaan Hafalan Santri',
      'Konsisten dalam menerima setoran': 'Sistem Setoran Hafalan',
      'Memantau progress': 'Monitoring Progress Hafalan',
      'Memberikan feedback': 'Feedback Konstruktif kepada Santri',
      'Perhatian terhadap santri': 'Perhatian Individual Santri',
      'Konsisten dalam pembinaan': 'Konsistensi Pembinaan'
    },
    'Sistem Penilaian & Evaluasi': {
      'default': 'Sistem Penilaian Hafalan',
      'Memiliki sistem pencatatan': 'Sistem Pencatatan yang Baik',
      'Menggunakan buku mutaba\'ah': 'Penggunaan Buku Mutaba\'ah',
      'Mendokumentasikan progress': 'Dokumentasi Progress Santri',
      'Melakukan evaluasi': 'Evaluasi Berkala Hafalan'
    },
    'Komunikasi & Koordinasi': {
      'default': 'Komunikasi dengan Stakeholder',
      'Berkomunikasi dengan orang tua': 'Komunikasi dengan Orang Tua',
      'Membuat laporan': 'Laporan Berkala Progress',
      'Berkoordinasi dengan tim': 'Koordinasi dengan Tim Pengajar',
      'Responsif terhadap pertanyaan': 'Responsivitas Komunikasi'
    },
    'Motivasi & Pembinaan Karakter': {
      'default': 'Motivasi dan Karakter Santri',
      'Memberikan motivasi ruhiyah': 'Motivasi Ruhiyah Santri',
      'Menanamkan adab': 'Penanaman Adab Al-Qur\'an',
      'Membina akhlak': 'Pembinaan Akhlak Santri',
      'Menjadi teladan': 'Keteladanan bagi Santri'
    },
    'Proses Setoran & Simakan': {
      'default': 'Proses Setoran dan Simakan',
      'Fokus saat menyimak': 'Fokus dalam Menyimak',
      'Memberikan koreksi': 'Koreksi Bacaan yang Detail',
      'Memberikan feedback': 'Feedback Setelah Setoran',
      'Teliti dalam mengoreksi': 'Ketelitian Koreksi',
      'Profesional dalam menyimak': 'Profesionalisme Simakan'
    },
    'Profesionalisme & Pengembangan Diri': {
      'default': 'Profesionalisme Guru',
      'Hadir tepat waktu': 'Kehadiran dan Ketepatan Waktu',
      'Aktif dalam rapat': 'Partisipasi dalam Rapat',
      'Mengikuti pelatihan': 'Pengembangan Kompetensi Diri',
      'Menunjukkan komitmen': 'Komitmen terhadap Profesi'
    }
  };

  const categoryMap = focusMap[categoryName] || {};

  // Try to find specific focus based on weakest indicator
  if (weakestItem) {
    for (const [key, value] of Object.entries(categoryMap)) {
      if (weakestItem.indicator_text.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
  }

  // Return default for category
  return categoryMap['default'] || categoryName;
};

// Get additional focus areas if needed
const getAdditionalFocusAreas = (categoryAverages: any[], existingFocusAreas: string[]): string[] => {
  const additionalAreas: string[] = [];

  // Sort by percentage ascending (lowest first)
  const sortedCategories = categoryAverages.sort((a, b) => a.percentage - b.percentage);

  for (const cat of sortedCategories) {
    const focusArea = mapCategoryToFocusArea(cat.name, cat.items);
    if (!existingFocusAreas.includes(focusArea) && !additionalAreas.includes(focusArea)) {
      additionalAreas.push(focusArea);
      if (additionalAreas.length >= 3) break;
    }
  }

  return additionalAreas;
};

// ============================================
// GENERATE FOCUS NOTES
// ============================================

export const generateFocusNotes = (
  focusAreas: string[],
  teacherName: string,
  previousSupervisions: any[]
): string => {
  if (focusAreas.length === 0) {
    return 'Supervisi umum untuk evaluasi menyeluruh semua aspek pembelajaran tahfidz.';
  }

  const templates = [
    `Supervisi ini akan fokus pada: ${focusAreas.join(', ')}. Mohon ${teacherName} mempersiapkan dokumentasi dan contoh terkait area-area tersebut.`,
    `Area fokus supervisi: ${focusAreas.join(', ')}. Harap siapkan bukti/dokumentasi yang relevan dengan area fokus ini.`,
    `Evaluasi khusus pada: ${focusAreas.join(', ')}. Persiapkan materi dan dokumentasi yang mendukung area fokus tersebut.`,
    `Fokus penilaian: ${focusAreas.join(', ')}. Silakan siapkan contoh praktik dan dokumentasi terkait.`
  ];

  const randomIndex = Math.floor(Math.random() * templates.length);
  let notes = templates[randomIndex];

  // Add context from previous supervision if available
  if (previousSupervisions && previousSupervisions.length > 0) {
    const latest = previousSupervisions[0];
    if (latest.percentage < 70) {
      notes += '\n\nCatatan: Ini adalah supervisi follow-up untuk memastikan perbaikan dari supervisi sebelumnya.';
    } else if (latest.percentage >= 80) {
      notes += '\n\nCatatan: Supervisi untuk mempertahankan kualitas dan peningkatan berkelanjutan.';
    }
  }

  return notes;
};
