// Script untuk memverifikasi konfigurasi OAuth Google
// Jalankan dengan: npx tsx verify-oauth-setup.ts

import { GOOGLE_CONFIG } from './src/config/googleConfig';

console.log('🔍 Verifikasi Konfigurasi OAuth Google');
console.log('=====================================');

console.log('\n📋 Konfigurasi Saat Ini:');
console.log(`Client ID: ${GOOGLE_CONFIG.clientId}`);
console.log(`Project ID: ${GOOGLE_CONFIG.projectId}`);
console.log(`API Key: ${GOOGLE_CONFIG.apiKey.substring(0, 10)}...`);

console.log('\n🌐 Origins yang Perlu Ditambahkan di Google Cloud Console:');
console.log('http://localhost:5173');
console.log('http://localhost:3000');
console.log('http://127.0.0.1:5173');
console.log('http://127.0.0.1:3000');

console.log('\n📝 Langkah-langkah:');
console.log('1. Buka https://console.cloud.google.com/');
console.log('2. Pilih project "laporan-kepsek"');
console.log('3. Pergi ke APIs & Services > Credentials');
console.log('4. Klik OAuth 2.0 Client ID');
console.log('5. Tambahkan origins di atas ke "Authorized JavaScript origins"');
console.log('6. Simpan perubahan');
console.log('7. Restart development server');

console.log('\n✅ Setelah konfigurasi selesai, jalankan:');
console.log('npm run dev');

console.log('\n🔗 Link Google Cloud Console:');
console.log(`https://console.cloud.google.com/apis/credentials/oauthclient/${GOOGLE_CONFIG.clientId}?project=${GOOGLE_CONFIG.projectId}`);
