export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://eyubefxeblzvavriltao.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dWJlZnhlYmx6dmF2cmlsdGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDc2NTUsImV4cCI6MjA3MzI4MzY1NX0.gToa-s0fDkfl1fKP0CGzLMAX4-21Grhu2WqeCBXNaKk';

// Debug environment variables
console.log('Environment check:', {
  NODE_ENV: import.meta.env.MODE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
});

console.log('Supabase Config (Updated):', {
  url: SUPABASE_URL,
  hasAnonKey: !!SUPABASE_ANON_KEY,
  anonKeyLength: SUPABASE_ANON_KEY.length,
  timestamp: new Date().toISOString()
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are not set. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your .env file.');
}