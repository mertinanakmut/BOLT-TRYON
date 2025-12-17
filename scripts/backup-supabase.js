// scripts/backup-supabase.js - KESİN ÇÖZÜM
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 .env.local aranıyor...')

// .env.local yolunu bul
const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local dosyası bulunamadı!')
  console.log('📁 Şu konumda arıyorum:', envPath)
  console.log('💡 .env.local dosyan şurada olmalı:', process.cwd())
  process.exit(1)
}

console.log('✅ .env.local bulundu:', envPath)

// .env.local'dan key'leri oku
function readEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const env = {}
  
  content.split('\n').forEach(line => {
    line = line.trim()
    // Boş satır ve yorumları atla
    if (!line || line.startsWith('#')) return
    
    const equalsIndex = line.indexOf('=')
    if (equalsIndex !== -1) {
      const key = line.substring(0, equalsIndex).trim()
      const value = line.substring(equalsIndex + 1).trim()
      
      // Tırnak işaretlerini temizle
      const cleanValue = value.replace(/^['"]|['"]$/g, '')
      env[key] = cleanValue
    }
  })
  
  return env
}

const env = readEnvFile(envPath)
console.log('📋 Okunan environment değişkenleri:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗')
console.log('- FAL_API_KEY:', env.FAL_API_KEY ? '✓' : '✗')

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('\n❌ Supabase credentials eksik!')
  console.log('📋 .env.local içeriğin:')
  console.log('='.repeat(50))
  console.log(fs.readFileSync(envPath, 'utf8'))
  console.log('='.repeat(50))
  console.log('\n💡 Eksik değişkenleri kontrol et:')
  console.log('1. NEXT_PUBLIC_SUPABASE_URL')
  console.log('2. SUPABASE_SERVICE_ROLE_KEY')
  console.log('3. .env.local dosyan doğru yerde mi?')
  process.exit(1)
}

console.log('\n✅ Credentials bulundu!')
console.log('📦 Veritabanı yedekleniyor...')

async function backupDatabase() {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .substring(0, 19)
  
  const backupDir = path.join(process.cwd(), 'backups', 'database')
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`)
  
  // Klasör oluştur
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
    console.log(`📁 Klasör oluşturuldu: ${backupDir}`)
  }
  
  try {
    // Tablolarını kontrol et (profiles tablon var mı?)
    console.log('🔗 Supabase\'e bağlanılıyor...')
    
    // Önce mevcut tabloları listele
    try {
      const listTablesCmd = `curl -s -X GET "${supabaseUrl}/rest/v1/?apikey=${serviceKey}"`
      const tablesResult = execSync(listTablesCmd, { encoding: 'utf8', stdio: 'pipe' })
      console.log('📊 Mevcut tablolar alındı')
    } catch (e) {
      console.log('ℹ️  Tablo listesi alınamadı, devam ediliyor...')
    }
    
    // HARDCODED: Senin tabloların (kendine göre düzenle)
    const tables = ['profiles'] // Sadece profiles tablon var
    
    const backupData = {
      timestamp: new Date().toISOString(),
      project: 'mert-app',
      tables: [],
      data: {}
    }
    
    for (const table of tables) {
      console.log(`\n📥 ${table} tablosu alınıyor...`)
      
      try {
        // curl ile veriyi çek
        const curlCommand = `curl -s -X GET "${supabaseUrl}/rest/v1/${table}?select=*" \
-H "apikey: ${serviceKey}" \
-H "Authorization: Bearer ${serviceKey}" \
-H "Content-Type: application/json"`
        
        console.log(`🔗 Komut: curl -X GET ${supabaseUrl}/rest/v1/${table}?select=*`)
        
        const result = execSync(curlCommand, { 
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024 // 10MB
        })
        
        if (!result || result.trim() === '') {
          console.log(`ℹ️  ${table} tablosu boş`)
          backupData.data[table] = []
        } else {
          const data = JSON.parse(result)
          backupData.data[table] = data
          backupData.tables.push(table)
          console.log(`✅ ${table}: ${data.length} kayıt`)
        }
        
      } catch (error) {
        console.error(`❌ ${table} hatası:`, error.message)
        
        // Daha detaylı hata
        if (error.message.includes('401')) {
          console.log('🔐 401 Hatası: API key geçersiz!')
          console.log('💡 Supabase Service Role Key\'ini kontrol et')
        } else if (error.message.includes('404')) {
          console.log(`📭 404: ${table} tablosu bulunamadı`)
          console.log('💡 Tablo ismini kontrol et veya yeni tablo oluştur')
        } else if (error.message.includes('JSON')) {
          console.log('📄 JSON parse hatası - Sunucudan farklı bir yanıt geldi')
          console.log('💡 CURL komutunu manuel çalıştır:')
          console.log(`curl -X GET "${supabaseUrl}/rest/v1/${table}?select=*" -H "apikey: ${serviceKey}"`)
        }
        
        backupData.data[table] = []
      }
    }
    
    // Dosyaya yaz
    fs.writeFileSync(
      backupFile,
      JSON.stringify(backupData, null, 2),
      'utf8'
    )
    
    const fileSize = fs.statSync(backupFile).size
    console.log(`\n✅ Yedek oluşturuldu: ${backupFile}`)
    console.log(`📏 Boyut: ${fileSize} bytes (${(fileSize / 1024).toFixed(2)} KB)`)
    console.log(`🗃️  Tablolar: ${backupData.tables.join(', ')}`)
    
    // Eski yedekleri temizle
    cleanupOldBackups(backupDir, 7)
    
    console.log('\n🎉 Backup tamamlandı!')
    
  } catch (error) {
    console.error('\n❌ Beklenmeyen hata:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

function cleanupOldBackups(backupDir, daysToKeep = 7) {
  const files = fs.readdirSync(backupDir)
  const now = Date.now()
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000
  
  let deletedCount = 0
  
  files.forEach(file => {
    if (file.endsWith('.json') && file.startsWith('backup-')) {
      const filePath = path.join(backupDir, file)
      const stat = fs.statSync(filePath)
      
      if (now - stat.mtimeMs > maxAge) {
        fs.unlinkSync(filePath)
        console.log(`🗑️  Eski yedek silindi: ${file}`)
        deletedCount++
      }
    }
  })
  
  if (deletedCount > 0) {
    console.log(`🧹 ${deletedCount} eski yedek temizlendi`)
  }
}

// Çalıştır
backupDatabase()