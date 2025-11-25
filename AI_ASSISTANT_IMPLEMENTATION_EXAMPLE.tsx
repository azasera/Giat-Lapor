// CONTOH IMPLEMENTASI AI ASSISTANT DI CreateReportPage.tsx
// Copy dan paste bagian ini ke file CreateReportPage.tsx

// 1. IMPORT AI ASSISTANT (tambahkan di bagian atas file)
import AIAssistant from '../components/AIAssistant';

// 2. CONTOH IMPLEMENTASI UNTUK FIELD "DESKRIPSI KEGIATAN"
// Ganti bagian form deskripsi yang ada dengan kode ini:

<div className="md:col-span-2">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Deskripsi Kegiatan
    </label>
    <AIAssistant
      fieldName="description"
      fieldLabel="Deskripsi Kegiatan"
      context={{
        category: activity.category,
        title: activity.title,
        involvedParties: activity.involvedParties
      }}
      onSuggestionSelect={(suggestion) => {
        updateActivity(activity.id, 'description', suggestion);
      }}
    />
  </div>
  <OptimizedInput
    type="textarea"
    value={activity.description}
    onChange={(value) => updateActivity(activity.id, 'description', value)}
    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
    placeholder="Jelaskan detail kegiatan yang dilaksanakan..."
    rows={3}
    title="Masukkan deskripsi kegiatan"
  />
</div>

// 3. CONTOH UNTUK FIELD "TUJUAN"
<div className="md:col-span-2">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Tujuan Kegiatan
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
    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
    placeholder="Apa tujuan dari kegiatan ini?"
    rows={3}
    title="Masukkan tujuan kegiatan"
  />
</div>

// 4. CONTOH UNTUK FIELD "HASIL"
<div className="md:col-span-2">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Hasil Kegiatan
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
    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
    placeholder="Apa hasil yang dicapai dari kegiatan ini?"
    rows={3}
    title="Masukkan hasil kegiatan"
  />
</div>

// 5. CONTOH UNTUK FIELD "DAMPAK"
<div className="md:col-span-2">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Dampak Kegiatan
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
    placeholder="Apa dampak dari kegiatan ini?"
    rows={3}
    title="Masukkan dampak kegiatan"
  />
</div>

// 6. CONTOH UNTUK FIELD "KENDALA"
<div className="md:col-span-2">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Kendala yang Dihadapi
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
    placeholder="Kendala apa yang dihadapi?"
    rows={3}
    title="Masukkan kendala yang dihadapi"
  />
</div>

// 7. CONTOH UNTUK FIELD "SOLUSI"
<div className="md:col-span-2">
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
    placeholder="Solusi apa yang diterapkan?"
    rows={3}
    title="Masukkan solusi yang diterapkan"
  />
</div>

// 8. CONTOH UNTUK FIELD "RENCANA TINDAK LANJUT"
<div className="md:col-span-2">
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
    placeholder="Apa rencana tindak lanjut dari kegiatan ini?"
    rows={3}
    title="Masukkan rencana tindak lanjut"
  />
</div>

// 9. CONTOH UNTUK ACHIEVEMENT SECTION
<div className="md:col-span-2">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Judul Prestasi
    </label>
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
    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
    placeholder="Contoh: Juara 1 Lomba Tahfidz Tingkat Provinsi"
    title="Masukkan judul prestasi"
  />
</div>

// CATATAN PENTING:
// - Pastikan sudah import AIAssistant di bagian atas file
// - Context bisa disesuaikan dengan field yang relevan
// - fieldName harus sesuai dengan database suggestions di AIAssistant.tsx
// - onSuggestionSelect akan otomatis mengisi field dengan suggestion yang dipilih
