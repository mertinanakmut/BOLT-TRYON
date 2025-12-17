const fs = require('fs')
const path = require('path')
require('dotenv').config()

const ENV = process.env

console.log('🔍 Environment Variables Security Check...\n')

const checks = [
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: ENV.SUPABASE_SERVICE_ROLE_KEY,
    safe: (val) => !val.includes('your_service_role_key_here') && val.length > 50,
    message: 'Service Role Key geçersiz! Hemen değiştir!'
  },
  {
    name: 'FAL_API_KEY',
    value: ENV.FAL_API_KEY,
    safe: (val) => val && val.length > 30,
    message: 'FAL API Key eksik!'
  },
  {
    name: 'SESSION_SECRET',
    value: ENV.SESSION_SECRET,
    safe: (val) => val && val.length >= 64,
    message: 'SESSION_SECRET eksik veya çok kısa!'
  },
  {
    name: 'ENCRYPTION_KEY',
    value: ENV.ENCRYPTION_KEY,
    safe: (val) => val && val.length >= 44,
    message: 'ENCRYPTION_KEY eksik!'
  }
]

let allSafe = true

checks.forEach(check => {
  if (check.value && check.safe(check.value)) {
    console.log(`✅ ${check.name}: OK`)
  } else {
    console.log(`❌ ${check.name}: ${check.message}`)
    allSafe = false
  }
})

if (!allSafe) {
  console.log('\n🚨 KRİTİK HATA: Güvenlik açıkları bulundu!')
  console.log('📋 Yapılacaklar:')
  console.log('1. npm run generate-keys ile yeni keyler oluştur')
  console.log('2. .env.local dosyasını güncelle')
  console.log('3. Uygulamayı yeniden başlat')
  process.exit(1)
} else {
  console.log('\n✅ Tüm güvenlik kontrolleri başarılı!')
}