// Test script untuk Google API functionality
// Jalankan setelah konfigurasi selesai

import { googleService } from './src/services/googleService';

async function testGoogleAPI() {
  console.log('🔧 Testing Google API Setup...\n');
  
  try {
    // 1. Test inisialisasi
    console.log('1. Initializing Google API...');
    const initialized = await googleService.initialize();
    
    if (!initialized) {
      console.error('❌ Failed to initialize Google API');
      return;
    }
    console.log('✅ Google API initialized successfully');
    
    // 2. Test autentikasi  
    console.log('\n2. Testing Google Sign In...');
    const signedIn = await googleService.signIn();
    
    if (!signedIn) {
      console.error('❌ Failed to sign in to Google');
      return;  
    }
    console.log('✅ Successfully signed in to Google');
    
    // 3. Test user info
    console.log('\n3. Getting user info...');
    const user = googleService.getCurrentUser();
    if (user) {
      console.log(`✅ Signed in as: ${user.getName()} (${user.getEmail()})`);
    }
    
    // 4. Test Sheets creation
    console.log('\n4. Testing Google Sheets creation...');
    const testData = [
      ['ID', 'Nama', 'Tanggal', 'Status'],
      ['001', 'Test Report', '2024-01-15', 'Draft'],
      ['002', 'Another Report', '2024-01-16', 'Review']
    ];
    
    const sheetId = await googleService.createSheetsDocument('Test Laporan API', testData);
    console.log(`✅ Created Google Sheets with ID: ${sheetId}`);
    console.log(`📄 View at: https://docs.google.com/spreadsheets/d/${sheetId}`);
    
    // 5. Test Drive upload (dengan file dummy)
    console.log('\n5. Testing Google Drive upload...');
    const dummyFile = new File(['Test content'], 'test-report.txt', { type: 'text/plain' });
    const driveFileId = await googleService.uploadToDrive(dummyFile, 'test-report.txt');
    console.log(`✅ Uploaded to Google Drive with ID: ${driveFileId}`);
    console.log(`📁 View at: https://drive.google.com/file/d/${driveFileId}`);
    
    console.log('\n🎉 All Google API tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Google API test failed:', error);
  }
}

// Export untuk dipanggil dari console atau komponen
export { testGoogleAPI };

// Auto-run jika dipanggil langsung
if (typeof window !== 'undefined') {
  // Tambahkan ke window untuk akses dari browser console
  (window as any).testGoogleAPI = testGoogleAPI;
  console.log('💡 Run testGoogleAPI() from browser console to test API');
}