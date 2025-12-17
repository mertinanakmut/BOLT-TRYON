// lib/env-check.ts
export function checkEnv() {
  const required = [
    'SESSION_SECRET',
    'ENCRYPTION_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing)
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing: ${missing.join(', ')}`)
    }
  } else {
    console.log('✅ All environment variables are set')
  }
}

// Uygulama başlangıcında çalıştır
if (typeof window === 'undefined') {
  checkEnv()
}