const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

console.log('🔐 Güvenli Key\'ler Oluşturuluyor...\n')

const keys = {
  SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
  ENCRYPTION_KEY: crypto.randomBytes(32).toString('base64'),
  JWT_SECRET: crypto.randomBytes(64).toString('hex'),
  CSRF_SECRET: crypto.randomBytes(32).toString('hex')
}

console.log('📋 Aşağıdaki key\'leri .env.local dosyasına ekle:\n')
console.log('=============================================')

Object.entries(keys).forEach(([key, value]) => {
  console.log(`${key}=${value}`)
})

console.log('=============================================\n')

// .env.example dosyasını güncelle
const envExamplePath = path.join(__dirname, '..', '.env.example')
let envExample = fs.existsSync(envExamplePath) 
  ? fs.readFileSync(envExamplePath, 'utf8')
  : ''

Object.keys(keys).forEach(key => {
  const placeholder = `${key}=your_${key.toLowerCase()}_here`
  if (!envExample.includes(placeholder)) {
    envExample += `${placeholder}\n`
  }
})

fs.writeFileSync(envExamplePath, envExample.trim())
console.log('✅ .env.example dosyası güncellendi!')
console.log('\n⚠️  BU KEY\'LERİ ASLA PAYLAŞMA! SADECE KENDİ .env.local DOSYANDA KULLAN!')