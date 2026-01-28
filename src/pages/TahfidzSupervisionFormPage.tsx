import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, ArrowLeft } from 'lucide-react';
import {
  SUPERVISION_CATEGORIES,
  TahfidzSupervision,
  TahfidzSupervisionItem,
  getScoreLabel,
  getCategoryFromPercentage,
  generateIndicatorNote
} from '../types/tahfidzSupervision';
import {
  createSupervision,
  updateSupervision,
  fetchSupervisionById,
  fetchSupervisionItems,
  saveSupervisionItems,
  calculateSupervisionScore,
  fetchTeachersList
} from '../services/tahfidzSupervisionService';
import { supabase } from '../services/supabaseService';
import { generateSupervisionSummary, generateWithOpenAI } from '../services/aiService';
import MediaUploader from '../components/MediaUploader';
import SupervisionGallery from '../components/SupervisionGallery';
import { uploadMultipleSupervisionPhotos, addPhotoToSupervision, deleteSupervisionPhoto, removePhotoFromSupervision } from '../services/tahfidzSupervisionService';

interface TahfidzSupervisionFormPageProps {
  id?: string;
  onSaved?: () => void;
}

const TahfidzSupervisionFormPage: React.FC<TahfidzSupervisionFormPageProps> = ({ id: propId, onSaved }) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');

  const [formData, setFormData] = useState({
    teacher_id: '',
    teacher_name: '',
    institution: '',
    supervision_date: new Date().toISOString().split('T')[0],
    period: '',
    year: new Date().getFullYear().toString(),
    notes: '',
    recommendations: '',
    strengths: '',
    weaknesses: '',
    action_plan: ''
  });

  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [itemNotes, setItemNotes] = useState<{ [key: string]: string }>({});
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStyle, setAiStyle] = useState<'detailed' | 'concise'>('detailed');
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [documentationPhotos, setDocumentationPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Accordion state
  const [openCategories, setOpenCategories] = useState<{ [key: number]: boolean }>({
    1: true // Open first category by default
  });

  const toggleCategory = (categoryNum: number) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryNum]: !prev[categoryNum]
    }));
  };

  const getCategoryProgress = (categoryNum: number) => {
    const category = SUPERVISION_CATEGORIES.find(c => c.number === categoryNum);
    if (!category) return 0;

    let filled = 0;
    category.indicators.forEach(indicator => {
      const key = `${categoryNum}-${indicator.number}`;
      if (scores[key]) filled++;
    });

    return Math.round((filled / category.indicators.length) * 100);
  };

  const getTotalProgress = () => {
    let totalIndicators = 0;
    let filledIndicators = 0;

    SUPERVISION_CATEGORIES.forEach(category => {
      totalIndicators += category.indicators.length;
      category.indicators.forEach(indicator => {
        const key = `${category.number}-${indicator.number}`;
        if (scores[key]) filledIndicators++;
      });
    });

    return totalIndicators > 0 ? Math.round((filledIndicators / totalIndicators) * 100) : 0;
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);
      const teachersData = await fetchTeachersList();
      setTeachers(teachersData);

      if (id) {
        const supervision = await fetchSupervisionById(id);
        const items = await fetchSupervisionItems(id);

        setFormData({
          teacher_id: supervision.teacher_id || '',
          teacher_name: supervision.teacher_name,
          institution: supervision.institution || '',
          supervision_date: supervision.supervision_date,
          period: supervision.period,
          year: supervision.year,
          notes: supervision.notes || '',
          recommendations: supervision.recommendations || '',
          strengths: supervision.strengths || '',
          weaknesses: supervision.weaknesses || '',
          action_plan: supervision.action_plan || ''
        });

        // Load documentation photos
        setDocumentationPhotos(supervision.documentation_photos || []);

        const scoresMap: { [key: string]: number } = {};
        const notesMap: { [key: string]: string } = {};
        items.forEach(item => {
          const key = `${item.category_number}-${item.indicator_number}`;
          scoresMap[key] = item.score;
          if (item.notes) notesMap[key] = item.notes;
        });
        setScores(scoresMap);
        setItemNotes(notesMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (categoryNum: number, indicatorNum: number, score: number) => {
    const key = `${categoryNum}-${indicatorNum}`;
    setScores({ ...scores, [key]: score });
  };

  const handleNoteChange = (categoryNum: number, indicatorNum: number, note: string) => {
    const key = `${categoryNum}-${indicatorNum}`;
    setItemNotes({ ...itemNotes, [key]: note });
  };

  const handleGenerateIndicatorNote = (
    categoryNum: number,
    indicatorNum: number,
    categoryName: string,
    indicatorText: string,
    score: number
  ) => {
    const key = `${categoryNum}-${indicatorNum}`;
    const note = generateIndicatorNote(categoryName, indicatorText, score);
    setItemNotes({ ...itemNotes, [key]: note });
  };

  const handleSave = async (status: 'draft' | 'submitted') => {
    try {
      setLoading(true);

      // Validate
      if (!formData.teacher_name || !formData.period) {
        alert('Mohon lengkapi data guru dan periode');
        return;
      }

      // Create items array
      const items: Partial<TahfidzSupervisionItem>[] = [];
      SUPERVISION_CATEGORIES.forEach(category => {
        category.indicators.forEach(indicator => {
          const key = `${category.number}-${indicator.number}`;
          const score = scores[key];
          if (score) {
            items.push({
              category_number: category.number,
              category_name: category.name,
              indicator_number: indicator.number,
              indicator_text: indicator.text,
              score: score as 1 | 2 | 3 | 4 | 5,
              notes: itemNotes[key] || undefined
            });
          }
        });
      });

      if (items.length === 0) {
        alert('Mohon isi minimal satu penilaian');
        return;
      }

      // Calculate score
      const scoreData = calculateSupervisionScore(items as TahfidzSupervisionItem[]);

      // Save supervision
      const supervisionData: Partial<TahfidzSupervision> = {
        ...formData,
        teacher_id: undefined, // Don't send teacher_id from teachers table (FK constraint to auth.users)
        user_id: currentUserId,
        status,
        total_score: scoreData.total_score,
        max_score: scoreData.max_score,
        percentage: scoreData.percentage,
        category: scoreData.category as any,
        documentation_photos: documentationPhotos,
        submitted_at: status === 'submitted' ? new Date().toISOString() : undefined
      };

      let supervisionId = id;
      if (id) {
        await updateSupervision(id, supervisionData);
      } else {
        const newSupervision = await createSupervision(supervisionData);
        supervisionId = newSupervision.id;
      }

      // Save items
      if (supervisionId) {
        await saveSupervisionItems(supervisionId, items.map(item => ({
          ...item,
          supervision_id: supervisionId
        })));
      }

      alert(status === 'draft' ? 'Draft berhasil disimpan!' : 'Supervisi berhasil disubmit!');
      navigate('/tahfidz-supervision');
    } catch (error) {
      console.error('Error saving supervision:', error);
      alert('Gagal menyimpan supervisi');
    } finally {
      setLoading(false);
    }
  };

  const getTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const getMaxScore = () => {
    return Object.keys(scores).length * 5;
  };

  const getPercentage = () => {
    const max = getMaxScore();
    return max > 0 ? Math.round((getTotalScore() / max) * 100) : 0;
  };

  const generateAIContent = () => {
    // Create items array from current scores
    const items: TahfidzSupervisionItem[] = [];
    SUPERVISION_CATEGORIES.forEach(category => {
      category.indicators.forEach(indicator => {
        const key = `${category.number}-${indicator.number}`;
        const score = scores[key];
        if (score) {
          items.push({
            id: '',
            supervision_id: '',
            category_number: category.number,
            category_name: category.name,
            indicator_number: indicator.number,
            indicator_text: indicator.text,
            score: score as 1 | 2 | 3 | 4 | 5,
            notes: itemNotes[key],
            created_at: '',
            updated_at: ''
          });
        }
      });
    });

    const scoreData = calculateSupervisionScore(items);

    return generateSupervisionSummary({
      teacherName: formData.teacher_name || 'Guru',
      period: formData.period || 'Semester 1',
      year: formData.year || new Date().getFullYear().toString(),
      items,
      totalScore: scoreData.total_score,
      percentage: scoreData.percentage,
      category: scoreData.category
    }, aiStyle);
  };

  const handleAIGenerate = async () => {
    if (Object.keys(scores).length === 0) {
      alert('Mohon isi minimal satu penilaian terlebih dahulu');
      return;
    }

    setAiGenerating(true);

    // Add small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const generated = generateAIContent();

      // Update form data
      setFormData({
        ...formData,
        strengths: generated.strengths,
        weaknesses: generated.weaknesses,
        recommendations: generated.recommendations,
        action_plan: generated.action_plan
      });

      // Show success feedback
      setGenerateSuccess(true);
      setTimeout(() => setGenerateSuccess(false), 3000);

      console.log('✨ Ringkasan berhasil di-generate dengan AI!');
    } catch (error) {
      console.error('Error generating AI summary:', error);
      alert('Gagal generate dengan AI. Silakan coba lagi.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleRegenerateField = async (field: 'strengths' | 'weaknesses' | 'recommendations' | 'action_plan') => {
    if (Object.keys(scores).length === 0) {
      alert('Mohon isi minimal satu penilaian terlebih dahulu');
      return;
    }

    try {
      // Create items array from current scores
      const items: TahfidzSupervisionItem[] = [];
      SUPERVISION_CATEGORIES.forEach(category => {
        category.indicators.forEach(indicator => {
          const key = `${category.number}-${indicator.number}`;
          const score = scores[key];
          if (score) {
            items.push({
              id: '',
              supervision_id: '',
              category_number: category.number,
              category_name: category.name,
              indicator_number: indicator.number,
              indicator_text: indicator.text,
              score: score as 1 | 2 | 3 | 4 | 5,
              notes: itemNotes[key],
              created_at: '',
              updated_at: ''
            });
          }
        });
      });

      const scoreData = calculateSupervisionScore(items);

      // Generate with UNIQUE seed for each regeneration
      const uniqueSeed = Date.now() + Math.random() * 100000;
      const generated = generateSupervisionSummary({
        teacherName: formData.teacher_name || 'Guru',
        period: formData.period || 'Semester 1',
        year: formData.year || new Date().getFullYear().toString(),
        items,
        totalScore: scoreData.total_score,
        percentage: scoreData.percentage,
        category: scoreData.category
      }, aiStyle);

      // Update only the specific field
      setFormData({
        ...formData,
        [field]: generated[field]
      });

      console.log(`✨ ${field} berhasil di-regenerate dengan seed: ${uniqueSeed}!`);
    } catch (error) {
      console.error(`Error regenerating ${field}:`, error);
      alert('Gagal regenerate. Silakan coba lagi.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-6xl">
      {!onSaved && (
        <button
          onClick={() => navigate('/tahfidz-supervision')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3 sm:mb-4 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Kembali</span>
        </button>
      )}

      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
        {id ? 'Edit' : 'Buat'} Supervisi Guru Tahfidz
      </h1>

      {/* Header Info */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Guru Tahfidz *</label>
            <select
              value={formData.teacher_id}
              onChange={(e) => {
                const teacher = teachers.find(t => t.id === e.target.value);
                setFormData({
                  ...formData,
                  teacher_id: e.target.value,
                  teacher_name: teacher?.name || '',
                  institution: teacher?.institution || 'SDITA'
                });
              }}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Pilih Guru</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.institution || 'SDITA'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Supervisi *</label>
            <input
              type="date"
              value={formData.supervision_date}
              onChange={(e) => setFormData({ ...formData, supervision_date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Periode *</label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              placeholder="Contoh: Semester 1, Januari"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tahun *</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
        </div>
      </div>

      {/* Score Summary - Mobile Optimized */}
      {Object.keys(scores).length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <span className="text-xs text-gray-600 block">Total Skor</span>
              <span className="text-lg sm:text-2xl font-bold text-blue-600 block">
                {getTotalScore()}/{getMaxScore()}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-600 block">Persentase</span>
              <span className="text-lg sm:text-2xl font-bold text-blue-600 block">{getPercentage()}%</span>
            </div>
            <div>
              <span className="text-xs text-gray-600 block">Kategori</span>
              <span className="text-sm sm:text-xl font-bold text-blue-600 block">
                {getCategoryFromPercentage(getPercentage())}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Overall Progress - Mobile Optimized */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700">Progress Keseluruhan</span>
          <span className="text-sm sm:text-base font-bold text-purple-600">{getTotalProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 sm:h-3 rounded-full transition-all duration-500"
            style={{ width: `${getTotalProgress()}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {Object.keys(scores).length} dari {SUPERVISION_CATEGORIES.reduce((sum, cat) => sum + cat.indicators.length, 0)} indikator terisi
        </p>
      </div>

      {/* Quick Navigation - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">📍 Navigasi Cepat</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {SUPERVISION_CATEGORIES.map(category => {
            const progress = getCategoryProgress(category.number);
            const isOpen = openCategories[category.number];
            return (
              <button
                key={category.number}
                onClick={() => {
                  toggleCategory(category.number);
                  // Scroll to category
                  const element = document.getElementById(`category-${category.number}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${progress === 100
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : progress > 0
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                  } ${isOpen ? 'ring-2 ring-purple-400' : ''}`}
              >
                <span className="hidden sm:inline">{category.number}. {category.name.split(' ')[0]}... {progress}%</span>
                <span className="sm:hidden">{category.number}. {progress}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories - Accordion Style - Mobile Optimized */}
      <div className="space-y-2 sm:space-y-3">
        {SUPERVISION_CATEGORIES.map(category => {
          const isOpen = openCategories[category.number];
          const progress = getCategoryProgress(category.number);

          return (
            <div
              key={category.number}
              id={`category-${category.number}`}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {/* Category Header - Clickable - Mobile Optimized */}
              <button
                onClick={() => toggleCategory(category.number)}
                className="w-full px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                    {category.number}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h2 className="text-sm sm:text-lg font-bold text-gray-800 truncate">
                      {category.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 sm:line-clamp-none">{category.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  {/* Progress Badge */}
                  <div className="text-right">
                    <div className={`text-xs sm:text-sm font-bold ${progress === 100 ? 'text-green-600' : progress > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      {progress}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.indicators.filter(ind => scores[`${category.number}-${ind.number}`]).length}/{category.indicators.length}
                    </div>
                  </div>

                  {/* Chevron Icon */}
                  <svg
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Category Content - Collapsible - Mobile Optimized */}
              {isOpen && (
                <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-2 border-t">
                  <div className="space-y-3 sm:space-y-4">
                    {category.indicators.map(indicator => {
                      const key = `${category.number}-${indicator.number}`;
                      const score = scores[key];

                      return (
                        <div key={key} className="border-l-4 border-blue-500 pl-3 sm:pl-4 py-3 bg-gray-50 rounded-r">
                          <p className="font-medium mb-3 text-sm sm:text-base pr-2">
                            {indicator.number}. {indicator.text}
                          </p>

                          {/* Mobile: Stack vertically, Desktop: Horizontal */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            {/* Score Buttons - Responsive sizing */}
                            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                              {[1, 2, 3, 4, 5].map(s => (
                                <button
                                  key={s}
                                  onClick={() => handleScoreChange(category.number, indicator.number, s)}
                                  className={`flex-1 sm:flex-none min-w-[50px] sm:min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg font-bold text-base sm:text-sm transition-all ${score === s
                                    ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-300'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-gray-300 active:scale-95'
                                    }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>

                            {/* AI Button - Full width on mobile */}
                            {score && (
                              <button
                                type="button"
                                onClick={() => handleGenerateIndicatorNote(category.number, indicator.number, category.name, indicator.text, score)}
                                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm hover:from-purple-600 hover:to-purple-700 active:scale-95 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                                title="Generate catatan AI"
                              >
                                ✨ AI Generate
                              </button>
                            )}
                          </div>

                          {score && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium bg-blue-50 px-2 py-1 rounded inline-block">
                              {getScoreLabel(score)}
                            </p>
                          )}

                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={itemNotes[key] || ''}
                              onChange={(e) => handleNoteChange(category.number, indicator.number, e.target.value)}
                              placeholder="Catatan (opsional)"
                              className="flex-1 border-2 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Fields */}
      <div className="bg-white rounded-lg shadow p-6 mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Ringkasan & Rekomendasi</h2>

          {/* Info badge if fields are filled */}
          {(formData.strengths || formData.weaknesses || formData.recommendations || formData.action_plan) && (
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              💡 Klik "🔄" untuk regenerate per kolom
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Style Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAiStyle('detailed')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${aiStyle === 'detailed'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-600'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
              >
                📝 Detail
              </button>
              <button
                type="button"
                onClick={() => setAiStyle('concise')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${aiStyle === 'concise'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-600'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
              >
                ⚡ Singkat
              </button>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiGenerating || Object.keys(scores).length === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg min-w-[140px] transition-all duration-300 ${generateSuccess
                ? 'bg-green-600 text-white'
                : aiGenerating
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {generateSuccess ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Berhasil!</span>
                </>
              ) : aiGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>✨ AI Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Overlay with Animation */}
        {aiGenerating && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-4 mb-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 bg-purple-600 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-purple-800 font-bold text-lg">✨ AI sedang menganalisis...</p>
                <p className="text-purple-600 text-sm">Menghasilkan ringkasan berdasarkan penilaian Anda</p>
                <div className="mt-2 flex gap-1">
                  <div className="h-1 w-8 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-1 w-8 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-1 w-8 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Hal yang Sudah Baik</label>
            {formData.strengths && (
              <button
                type="button"
                onClick={() => handleRegenerateField('strengths')}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                title="Regenerate dengan variasi berbeda"
              >
                🔄 Regenerate
              </button>
            )}
          </div>
          <textarea
            value={formData.strengths}
            onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Hal-hal positif yang sudah dilakukan dengan baik..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Hal yang Perlu Diperbaiki</label>
            {formData.weaknesses && (
              <button
                type="button"
                onClick={() => handleRegenerateField('weaknesses')}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                title="Regenerate dengan variasi berbeda"
              >
                🔄 Regenerate
              </button>
            )}
          </div>
          <textarea
            value={formData.weaknesses}
            onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Hal-hal yang masih perlu ditingkatkan..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Rekomendasi</label>
            {formData.recommendations && (
              <button
                type="button"
                onClick={() => handleRegenerateField('recommendations')}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                title="Regenerate dengan variasi berbeda"
              >
                🔄 Regenerate
              </button>
            )}
          </div>
          <textarea
            value={formData.recommendations}
            onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Saran perbaikan..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Rencana Tindak Lanjut</label>
            {formData.action_plan && (
              <button
                type="button"
                onClick={() => handleRegenerateField('action_plan')}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                title="Regenerate dengan variasi berbeda"
              >
                🔄 Regenerate
              </button>
            )}
          </div>
          <textarea
            value={formData.action_plan}
            onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Action plan konkret..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Catatan Umum</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Catatan tambahan..."
          />
        </div>
      </div>

      {/* Documentation Upload */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📸 Dokumentasi Supervisi</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload foto atau video sebagai bukti dokumentasi supervisi (opsional)
        </p>

        {/* Existing Photos Gallery */}
        {documentationPhotos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Foto/Video yang Sudah Diupload ({documentationPhotos.length})</h3>
            <SupervisionGallery
              photos={documentationPhotos}
              onDelete={async (photoUrl) => {
                if (id) {
                  // If editing existing supervision, delete from storage and database
                  await deleteSupervisionPhoto(photoUrl);
                  await removePhotoFromSupervision(id, photoUrl);
                }
                // Remove from local state
                setDocumentationPhotos(documentationPhotos.filter(p => p !== photoUrl));
              }}
              readOnly={false}
            />
          </div>
        )}

        {/* Upload New Photos */}
        <MediaUploader
          onUpload={async (files) => {
            setUploadingPhotos(true);
            try {
              // Upload files to storage
              const uploadedUrls = await uploadMultipleSupervisionPhotos(
                files,
                id || 'temp', // Use temp ID for new supervisions
                currentUserId
              );

              // Add to local state
              setDocumentationPhotos([...documentationPhotos, ...uploadedUrls]);

              // If editing existing supervision, also update database
              if (id) {
                for (const url of uploadedUrls) {
                  await addPhotoToSupervision(id, url);
                }
              }

              alert(`Berhasil upload ${uploadedUrls.length} file!`);
            } catch (error) {
              console.error('Upload error:', error);
              alert('Gagal upload file. Silakan coba lagi.');
            } finally {
              setUploadingPhotos(false);
            }
          }}
          disabled={uploadingPhotos}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6 justify-end">
        <button
          onClick={() => handleSave('draft')}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
        >
          <Save size={20} />
          Simpan Draft
        </button>
        <button
          onClick={() => handleSave('submitted')}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Send size={20} />
          Submit
        </button>
      </div>
    </div>
  );
};

export default TahfidzSupervisionFormPage;
