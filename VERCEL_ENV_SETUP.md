# Vercel Environment Variables Setup

## 🚨 Issue Fixed
The "supabaseUrl is required" error has been resolved by adding fallback values to the Supabase configuration.

## 🔧 Proper Setup for Future Deployments

### Option 1: Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `VITE_SUPABASE_URL` = `https://eyubefxeblzvavriltao.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dWJlZnhlYmx6dmF2cmlsdGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDc2NTUsImV4cCI6MjA3MzI4MzY1NX0.gToa-s0fDkfl1fKP0CGzLMAX4-21Grhu2WqeCBXNaKk`
5. Set environment to **Production**, **Preview**, and **Development**
6. Redeploy the project

### Option 2: Vercel CLI
```bash
vercel env add VITE_SUPABASE_URL
# Enter: https://eyubefxeblzvavriltao.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY  
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dWJlZnhlYmx6dmF2cmlsdGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDc2NTUsImV4cCI6MjA3MzI4MzY1NX0.gToa-s0fDkfl1fKP0CGzLMAX4-21Grhu2WqeCBXNaKk
```

## ✅ Current Status
- **Fixed**: Added fallback values in `src/config/supabaseConfig.ts`
- **Deployed**: Latest version should work without environment variable issues
- **Recommended**: Still set up proper environment variables in Vercel dashboard

## 🔍 Verification
After deployment, check browser console for:
```
Supabase Config (Updated): {
  url: "https://eyubefxeblzvavriltao.supabase.co",
  hasAnonKey: true,
  anonKeyLength: 191,
  timestamp: "..."
}
```

## 📝 Notes
- The `.env` file is not used in production builds
- Vite requires `VITE_` prefix for environment variables
- Fallback values ensure the app works even without proper env setup
- For security, consider using Vercel's environment variables instead of hardcoded fallbacks