import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, Send, CheckCircle, CalendarDays, Clock, MapPin } from 'lucide-react';
import OptimizedInput from '../components/OptimizedInput';
import OptimizedSelect from '../components/OptimizedSelect';
import OptimizedRange from '../components/OptimizedRange';
import Tabs from '../components/Tabs'; // Import Tabs component
import AIAssistant from '../components/AIAssistant'; // Import AI Assistant
import { ReportData, Activity, Achievement, DetailedEvaluationItem, allDetailedEvaluationItems, activityCategories, reportPeriodOptions, ReportPeriodKey } from '../types/report';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast'; // Import toast utilities

interface CreateReportPageProps {
  currentReport: ReportData;
  setCurrentReport: React.Dispatch<React.SetStateAction<ReportData>>;
  saveReport: () => void;
  submitReport: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
  // showSuccessMessage: boolean; // Replaced by toast
  // setShowSuccessMessage: React.Dispatch<React.SetStateAction<boolean>>; // Replaced by toast
  getAveragePerformance: (evaluation: { [itemId: string]: number }) => number; // Update type
  allDetailedEvaluationItems: DetailedEvaluationItem[]; // New prop
}

const CreateReportPage: React.FC<CreateReportPageProps> = ({
  currentReport,
  setCurrentReport,
  saveReport,
  submitReport,
  resetForm,
  isLoading,
  // showSuccessMessage, // Replaced by toast
  // setShowSuccessMessage, // Replaced by toast
  getAveragePerformance,
  allDetailedEvaluationItems,
}) => {

  const addActivity = useCallback(() => {
    const newActivity: Activity = {
      id: `ACT-${Date.now()}`, // Temporary ID for new activities
      category: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0], // Default to today's date for activity
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }), // Initialize with 24-hour format
      location: '',
      involvedParties: '',
      participants: 0,
      outcome: '',
      islamicValue: '',
      goals: '',
      results: '',
      impact: '',
      challenges: '',
      solutions: '',
      followUpPlan: '',
      documentationLink: '',
      attachmentLink: '',
      additionalNotes: ''
    };
    setCurrentReport(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
  }, [setCurrentReport]);

  const updateActivity = useCallback((id: string, field: keyof Activity, value: string | number) => {
    setCurrentReport(prev => {
      const updatedActivities = prev.activities.map(act =>
        act.id === id ? { ...act, [field]: value } : act
      );
      return {
        ...prev,
        activities: updatedActivities
      };
    });
  }, [setCurrentReport]);

  const removeActivity = useCallback((id: string) => {
    setCurrentReport(prev => ({
      ...prev,
      activities: prev.activities.filter(act => act.id !== id)
    }));
  }, [setCurrentReport]);

  const addAchievement = useCallback(() => {
    const newAchievement: Achievement = {
      id: `ACH-${Date.now()}`, // Temporary ID for new achievements
      title: '',
      description: '',
      impact: '',
      evidence: ''
    };
    setCurrentReport(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
  }, [setCurrentReport]);

  const updateAchievement = useCallback((id: string, field: keyof Achievement, value: string) => {
    setCurrentReport(prev => {
      const updatedAchievements = prev.achievements.map(ach =>
        ach.id === id ? { ...ach, [field]: value } : ach
      );
      return {
        ...prev,
        achievements: updatedAchievements
      };
    });
  }, [setCurrentReport]);

  const removeAchievement = useCallback((id: string) => {
    setCurrentReport(prev => ({
      ...prev,
      achievements: prev.achievements.filter(ach => ach.id !== id)
    }));
  }, [setCurrentReport]);

  // Fungsi baru untuk memperbarui principalEvaluation
  const updatePrincipalEvaluation = useCallback((itemId: string, score: number) => {
    setCurrentReport(prev => ({
      ...prev,
      principalEvaluation: {
        ...prev.principalEvaluation,
        [itemId]: score
      }
    }));
  }, [setCurrentReport]);

  const updateBasicInfo = useCallback((field: keyof ReportData, value: string) => {
    setCurrentReport(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setCurrentReport]);

  // Group evaluation items by Bidang and Kategori for display
  const groupedEvaluationItems = useMemo(() => {
    const grouped: { [bidang: string]: { [kategori: string]: DetailedEvaluationItem[] } } = {};
    allDetailedEvaluationItems.forEach(item => {
      if (!grouped[item.bidang]) {
        grouped[item.bidang] = {};
      }
      if (!grouped[item.bidang][item.kategori]) {
        grouped[item.bidang][item.kategori] = [];
      }
      grouped[item.bidang][item.kategori].push(item);
    });
    return grouped;
  }, [allDetailedEvaluationItems]);

  // Prepare tabs data for the Tabs component
  const evaluationTabs = useMemo(() => {
    return Object.entries(groupedEvaluationItems).map(([bidang, kategoriGroup]) => ({
      id: bidang,
      label: bidang,
      content: (
        <div className="space-y-6">
          {Object.entries(kategoriGroup).map(([kategori, items]) => (
            <div key={kategori} className="mb-6 ml-4 border-l-4 border-emerald-300 pl-4">
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{kategori}</h5>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">{item.item}</p> {/* Removed '*' for optional */}
                    <OptimizedSelect
                      value={currentReport.principalEvaluation[item.id]?.toString() || ''}
                      onChange={(value) => updatePrincipalEvaluation(item.id, parseFloat(value))}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-600 dark:text-white ${
                        !currentReport.principalEvaluation[item.id] && currentReport.principalEvaluation[item.id] !== 0 ? 'border-gray-300 dark:border-gray-600' : 'border-gray-300 dark:border-gray-500' // Removed red border for optional
                      }`}
                      title={`Pilih bobot untuk: ${item.item}`}
                      // Removed 'required' prop
                    >
                      <option value="">Pilih Bobot</option>
                      {item.bobotOptions.map(option => (
                        <option key={option.score} value={option.score}>
                          {option.score} - {option.description}
                        </option>
                      ))}
                    </OptimizedSelect>
                    {/* Removed conditional error message for optional fields */}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    }));
  }, [groupedEvaluationItems, currentReport.principalEvaluation, updatePrincipalEvaluation]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {currentReport.id ? 'Edit Laporan' : 'Buat Laporan Baru'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">Dokumentasikan kegiatan dan pencapaian dengan penuh amanah</p>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informasi Dasar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Kepala Sekolah</label>
            <OptimizedInput
              type="text"
              value={currentReport.principalName}
              onChange={(value) => updateBasicInfo('principalName', value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              placeholder="Masukkan nama lengkap"
              title="Masukkan nama lengkap kepala sekolah"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Sekolah</label>
            <OptimizedInput
              type="text"
              value={currentReport.schoolName}
              onChange={(value) => updateBasicInfo('schoolName', value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nama sekolah/madrasah"
              title="Masukkan nama sekolah atau madrasah"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Laporan</label>
            <OptimizedInput
              type="date"
              value={currentReport.date}
              onChange={(value) => updateBasicInfo('date', value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              title="Pilih tanggal laporan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Periode Laporan</label>
            <OptimizedSelect
              value={currentReport.period}
              onChange={(value) => updateBasicInfo('period', value as ReportPeriodKey)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              title="Pilih periode laporan"
            >
              {Object.entries(reportPeriodOptions).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </OptimizedSelect>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Kegiatan yang Dilaksanakan</h3>
          <button
            onClick={addActivity}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Tambah Kegiatan
          </button>
        </div>
        
        <div className="space-y-6">
          {currentReport.activities.map((activity) => (
            <div key={activity.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Informasi Dasar Kegiatan</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <OptimizedInput
                    type="text"
                    value={activity.title}
                    onChange={(value) => updateActivity(activity.id, 'title', value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: Rapat Koordinasi dengan Wali Santri"
                    title="Masukkan nama kegiatan"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <OptimizedSelect
                    value={activity.category}
                    onChange={(value) => updateActivity(activity.id, 'category', value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${
                      !activity.category ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    title="Pilih kategori kegiatan"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {activityCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </OptimizedSelect>
                  {!activity.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Kategori Kegiatan harus diisi
                    </p>
                  )}
                </div>
              </div>

              {/* Detail Pelaksanaan Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Detail Pelaksanaan</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Pelaksanaan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                  <OptimizedInput
                    type="date"
                    value={activity.date}
                    onChange={(value) => updateActivity(activity.id, 'date', value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white pr-10"
                        title="Pilih tanggal pelaksanaan"
                        required
                  />
                      <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Waktu Pelaksanaan
                    </label>
                    <div className="relative">
                      <OptimizedInput
                        type="time"
                        value={activity.time}
                        onChange={(value) => updateActivity(activity.id, 'time', value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white pr-10"
                        title="Pilih waktu pelaksanaan"
                      />
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                  
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tempat/Lokasi Kegiatan
                    </label>
                    <div className="relative">
                  <OptimizedInput
                    type="text"
                        value={activity.location}
                        onChange={(value) => updateActivity(activity.id, 'location', value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white pr-10"
                        placeholder="Contoh: Ruang Rapat Pesantren"
                        title="Masukkan tempat atau lokasi kegiatan"
                      />
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                  </div>
                  
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Peserta/Pihak yang Terlibat <span className="text-red-500">*</span>
                    </label>
                  <OptimizedInput
                      type="textarea"
                      value={activity.involvedParties}
                      onChange={(value) => updateActivity(activity.id, 'involvedParties', value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${
                        !activity.involvedParties ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    rows={3}
                      placeholder="Sebutkan jumlah dan jenis peserta (guru, staff, santri, wali santri, dll)"
                      title="Masukkan detail peserta dan pihak yang terlibat"
                      required
                    />
                    {!activity.involvedParties && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        Peserta/Pihak yang Terlibat harus diisi
                      </p>
                    )}
                </div>
                </div>
              </div>

              {/* Tujuan dan Hasil Kegiatan Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Tujuan dan Hasil Kegiatan</h4>
                
                <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tujuan/Target Kegiatan <span className="text-red-500">*</span>
                      </label>
                      <AIAssistant
                        fieldName="goals"
                        fieldLabel="Tujuan Kegiatan"
                        context={{
                          category: activity.category,
                          title: activity.title,
                          involvedParties: activity.involvedParties
                        }}
                        onSuggestionSelect={(suggestion) => {
                          updateActivity(activity.id, 'goals', suggestion);
                        }}
                      />
                    </div>
                    <OptimizedInput
                      type="textarea"
                      value={activity.goals}
                      onChange={(value) => updateActivity(activity.id, 'goals', value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${
                        !activity.goals ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      rows={3}
                      placeholder="Jelaskan tujuan dan target yang ingin dicapai dari kegiatan ini"
                      title="Masukkan tujuan dan target kegiatan"
                      required
                    />
                    {!activity.goals && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        Tujuan/Target Kegiatan harus diisi
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hasil/Output Kegiatan <span className="text-red-500">*</span>
                      </label>
                      <AIAssistant
                        fieldName="results"
                        fieldLabel="Hasil Kegiatan"
                        context={{
                          category: activity.category,
                          title: activity.title,
                          goals: activity.goals
                        }}
                        onSuggestionSelect={(suggestion) => {
                          updateActivity(activity.id, 'results', suggestion);
                        }}
                      />
                    </div>
                    <OptimizedInput
                      type="textarea"
                      value={activity.results}
                      onChange={(value) => updateActivity(activity.id, 'results', value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white ${
                        !activity.results ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      rows={3}
                      placeholder="Jelaskan hasil konkret yang dicapai dari kegiatan ini"
                      title="Masukkan hasil dan output kegiatan"
                      required
                    />
                    {!activity.results && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        Hasil/Output Kegiatan harus diisi
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dampak terhadap Pesantren
                      </label>
                      <AIAssistant
                        fieldName="impact"
                        fieldLabel="Dampak Kegiatan"
                        context={{
                          category: activity.category,
                          title: activity.title,
                          results: activity.results
                        }}
                        onSuggestionSelect={(suggestion) => {
                          updateActivity(activity.id, 'impact', suggestion);
                        }}
                      />
                    </div>
                    <OptimizedInput
                      type="textarea"
                      value={activity.impact}
                      onChange={(value) => updateActivity(activity.id, 'impact', value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Jelaskan dampak positif kegiatan ini terhadap kemajuan pesantren"
                      title="Masukkan dampak kegiatan terhadap pesantren"
                    />
                  </div>
                </div>
              </div>

              {/* Evaluasi dan Tindak Lanjut Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Evaluasi dan Tindak Lanjut</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kendala/Hambatan yang Dihadapi
                      </label>
                      <AIAssistant
                        fieldName="challenges"
                        fieldLabel="Kendala"
                        context={{
                          category: activity.category,
                          title: activity.title
                        }}
                        onSuggestionSelect={(suggestion) => {
                          updateActivity(activity.id, 'challenges', suggestion);
                        }}
                      />
                    </div>
                    <OptimizedInput
                      type="textarea"
                      value={activity.challenges}
                      onChange={(value) => updateActivity(activity.id, 'challenges', value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Sebutkan kendala yang dihadapi selama kegiatan (jika ada)"
                      title="Masukkan kendala atau hambatan yang dihadapi"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Solusi yang Diterapkan
                      </label>
                      <AIAssistant
                        fieldName="solutions"
                        fieldLabel="Solusi"
                        context={{
                          category: activity.category,
                          title: activity.title,
                          challenges: activity.challenges
                        }}
                        onSuggestionSelect={(suggestion) => {
                          updateActivity(activity.id, 'solutions', suggestion);
                        }}
                      />
                    </div>
                    <OptimizedInput
                      type="textarea"
                      value={activity.solutions}
                      onChange={(value) => updateActivity(activity.id, 'solutions', value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Jelaskan solusi yang diterapkan untuk mengatasi kendala"
                      title="Masukkan solusi yang diterapkan"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rencana Tindak Lanjut
                      </label>
                      <AIAssistant
                        fieldName="followUpPlan"
                        fieldLabel="Rencana Tindak Lanjut"
                        context={{
                          category: activity.category,
                          title: activity.title,
                          results: activity.results
                        }}
                        onSuggestionSelect={(suggestion) => {
                          updateActivity(activity.id, 'followUpPlan', suggestion);
                        }}
                      />
                    </div>
                    <OptimizedInput
                      type="textarea"
                      value={activity.followUpPlan}
                      onChange={(value) => updateActivity(activity.id, 'followUpPlan', value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Jelaskan rencana tindak lanjut atau kegiatan serupa di masa mendatang"
                      title="Masukkan rencana tindak lanjut"
                    />
                  </div>
                </div>
              </div>

              {/* Dokumentasi dan Lampiran Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Dokumentasi dan Lampiran</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Link Dokumentasi (Foto/Video)
                    </label>
                  <OptimizedInput
                      type="url"
                      value={activity.documentationLink}
                      onChange={(value) => updateActivity(activity.id, 'documentationLink', value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://drive.google.com/..."
                      title="Link ke foto atau video dokumentasi kegiatan"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Link Lampiran Dokumen
                    </label>
                  <OptimizedInput
                      type="url"
                      value={activity.attachmentLink}
                      onChange={(value) => updateActivity(activity.id, 'attachmentLink', value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://drive.google.com/..."
                      title="Link ke dokumen lampiran (misal: PDF, Word)"
                  />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catatan Tambahan
                    </label>
                  <OptimizedInput
                      type="textarea"
                      value={activity.additionalNotes}
                      onChange={(value) => updateActivity(activity.id, 'additionalNotes', value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Catatan atau informasi tambahan lainnya"
                      title="Tambahkan catatan atau informasi tambahan terkait dokumentasi"
                  />
                </div>
              </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => removeActivity(activity.id)}
                  className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Hapus Kegiatan
                </button>
              </div>
            </div>
          ))}
          {currentReport.activities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">📋</div>
              <p className="text-gray-500 text-lg">Belum ada kegiatan ditambahkan</p>
              <p className="text-gray-400 text-sm mt-2">Klik tombol "Tambah Kegiatan" untuk memulai</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Performance Evaluation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Evaluasi Kinerja Kepala Sekolah</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Anda tidak wajib mengisi bagian ini untuk setiap laporan. Disarankan untuk mengisi penilaian diri pada laporan periodik (misalnya bulanan atau tahunan).
        </p>
        
        {/* Render Tabs here */}
        <Tabs tabs={evaluationTabs} defaultActiveTabId={evaluationTabs.length > 0 ? evaluationTabs[0].id : ''} />
        
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <p className="text-emerald-800 dark:text-emerald-200 font-medium">
            Rata-rata Kinerja: {(getAveragePerformance(currentReport.principalEvaluation) * 10).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Prestasi & Pencapaian</h3>
          <button
            onClick={addAchievement}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Tambah Prestasi
          </button>
        </div>
        
        <div className="space-y-4">
          {currentReport.achievements.map((achievement) => (
            <div key={achievement.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul Prestasi</label>
                    <AIAssistant
                      fieldName="achievement_title"
                      fieldLabel="Judul Prestasi"
                      context={{
                        category: 'Prestasi'
                      }}
                      onSuggestionSelect={(suggestion) => {
                        updateAchievement(achievement.id, 'title', suggestion);
                      }}
                    />
                  </div>
                  <OptimizedInput
                    type="text"
                    value={achievement.title}
                    onChange={(value) => updateAchievement(achievement.id, 'title', value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Nama prestasi/pencapaian"
                    title="Masukkan judul prestasi atau pencapaian"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                    <AIAssistant
                      fieldName="achievement_description"
                      fieldLabel="Deskripsi Prestasi"
                      context={{
                        category: 'Prestasi',
                        title: achievement.title
                      }}
                      onSuggestionSelect={(suggestion) => {
                        updateAchievement(achievement.id, 'description', suggestion);
                      }}
                    />
                  </div>
                  <OptimizedInput
                    type="textarea"
                    value={achievement.description}
                    onChange={(value) => updateAchievement(achievement.id, 'description', value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Detail prestasi yang dicapai"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dampak</label>
                    <AIAssistant
                      fieldName="achievement_impact"
                      fieldLabel="Dampak Prestasi"
                      context={{
                        category: 'Prestasi',
                        title: achievement.title
                      }}
                      onSuggestionSelect={(suggestion) => {
                        updateAchievement(achievement.id, 'impact', suggestion);
                      }}
                    />
                  </div>
                  <OptimizedInput
                    type="textarea"
                    value={achievement.impact}
                    onChange={(value) => updateAchievement(achievement.id, 'impact', value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                    rows={2}
                    placeholder="Dampak bagi sekolah/siswa"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bukti/Evidence</label>
                    <AIAssistant
                      fieldName="achievement_evidence"
                      fieldLabel="Bukti Prestasi"
                      context={{
                        category: 'Prestasi',
                        title: achievement.title
                      }}
                      onSuggestionSelect={(suggestion) => {
                        updateAchievement(achievement.id, 'evidence', suggestion);
                      }}
                    />
                  </div>
                  <OptimizedInput
                    type="textarea"
                    value={achievement.evidence}
                    onChange={(value) => updateAchievement(achievement.id, 'evidence', value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                    rows={2}
                    placeholder="Dokumen/foto pendukung"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => removeAchievement(achievement.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Hapus Prestasi
                </button>
              </div>
            </div>
          ))}
          {currentReport.achievements.length === 0 && (
            <p className="text-gray-500 text-center py-8">Belum ada prestasi ditambahkan</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset Form
          </button>
          <button
            onClick={saveReport}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            disabled={isLoading}
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Menyimpan...' : 'Simpan Draft'}</span>
          </button>
          <button
            onClick={submitReport}
            disabled={isLoading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>{isLoading ? 'Mengirim...' : 'Kirim ke Yayasan'}</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {/* {showSuccessMessage && ( // Replaced by toast
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <CheckCircle className="w-5 h-5" />
          <span>Laporan berhasil disimpan!</span>
        </div>
      )} */}
    </div>
  );
};

export default CreateReportPage;