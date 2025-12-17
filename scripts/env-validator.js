require('dotenv').config()

function validateEnv() {
  const required = {
    development: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'FAL_API_KEY',
      'SESSION_SECRET',
      'ENCRYPTION_KEY'
    ],
    production: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'FAL_API_KEY',
      'SESSION_SECRET',
      'ENCRYPTION_KEY',
      'NEXT_PUBLIC_SITE_URL'
    ]
  }

  const env = process.env.NODE_ENV || 'development'
  const missing = required[env].filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables for ${env}:`)
    missing.forEach(key => console.error(`   - ${key}`))
    
    if (env === 'production') {
      process.exit(1)
    } else {
      console.log('\n⚠️  Development modunda çalışıyorsun. Bu değişkenleri ekle:')
      console.log('   npm run generate-keys')
      console.log('   Ve .env.local dosyasını düzenle')
    }
  } else {
    console.log(`✅ Tüm ${env} environment variables mevcut`)
  }
}

validateEnv()