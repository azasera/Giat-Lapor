import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eyubefxeblzvavriltao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dWJlZnhlYmx6dmF2cmlsdGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDc2NTUsImV4cCI6MjA3MzI4MzY1NX0.gToa-s0fDkfl1fKP0CGzLMAX4-21Grhu2WqeCBXNaKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAdminAccounts() {
  console.log('🔍 Mencari akun admin...\n');

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️  Tidak ada profil yang ditemukan');
    return;
  }

  // Filter admin accounts
  const adminAccounts = profiles.filter(p => p.role === 'admin');
  const principalAccounts = profiles.filter(p => p.role === 'principal');
  const foundationAccounts = profiles.filter(p => p.role === 'foundation');

  console.log('📊 RINGKASAN:');
  console.log(`   Total Akun: ${profiles.length}`);
  console.log(`   Admin: ${adminAccounts.length}`);
  console.log(`   Kepala Sekolah: ${principalAccounts.length}`);
  console.log(`   Yayasan: ${foundationAccounts.length}\n`);

  if (adminAccounts.length > 0) {
    console.log('👑 AKUN ADMIN:');
    adminAccounts.forEach((admin, index) => {
      console.log(`\n   ${index + 1}. ${admin.full_name || admin.username || 'Tidak ada nama'}`);
      console.log(`      Username: ${admin.username || 'Tidak ada'}`);
      console.log(`      ID: ${admin.id}`);
      console.log(`      Email (dari auth.users): Perlu dicek di Supabase dashboard`);
      console.log(`      Terakhir diupdate: ${new Date(admin.updated_at).toLocaleString('id-ID')}`);
    });
  } else {
    console.log('⚠️  Tidak ada akun admin yang ditemukan');
  }

  // Show all accounts for reference
  console.log('\n📋 SEMUA AKUN:');
  profiles.forEach((profile, index) => {
    const roleIcon = profile.role === 'admin' ? '👑' : profile.role === 'foundation' ? '🏢' : '👤';
    console.log(`\n   ${index + 1}. ${roleIcon} ${profile.full_name || profile.username || 'Tidak ada nama'}`);
    console.log(`      Role: ${profile.role}`);
    console.log(`      Username: ${profile.username || 'Tidak ada'}`);
    console.log(`      ID: ${profile.id}`);
  });
}

checkAdminAccounts()
  .then(() => {
    console.log('\n✅ Selesai');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

