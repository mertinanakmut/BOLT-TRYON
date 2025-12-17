// scripts/backup-fixed.js - EN GARANTİ ÇÖZÜM
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Backup başlıyor...')

// DOĞRUDAN SENİN KEY'LERİNİ YAPIŞTIR
const SUPABASE_URL = "https://khrghrlggjfrtnoimydn.supabase.co"
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocmdocmxnZ2pmcnRub2lteWRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUwNDA5NSwiZXhwIjoyMDgxMDgwMDk1fQ.XjRPUyttvYQ_SRyn-nuea6Pcq1jmIt52wsEwwt610Fo"

// 1. Backup klasörü oluştur
const backupDir = path.join(__dirname, '..', 'backups', 'database')
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
  console.log(`📁 Klasör oluşturuldu: ${backupDir}`)
}

// 2. Timestamp
const now = new Date()
const dateStr = now.toISOString().split('T')[0]
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
const timestamp = `${dateStr}_${timeStr}`

const backupFile = path.join(backupDir, `backup-${timestamp}.json`)

console.log(`📊 Supabase: ${SUPABASE_URL}`)
console.log(`⏰ Zaman: ${timestamp}`)

try {
  // 3. Profiles tablosunu al
  console.log('\n📥 Profiles tablosu alınıyor...')
  
  const curlCommand = `curl -s -X GET "${SUPABASE_URL}/rest/v1/profiles?select=*" -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}" -H "Content-Type: application/json"`
  
  console.log(`🔗 Komut: curl ${SUPABASE_URL}/rest/v1/profiles`)
  
  const result = execSync(curlCommand, { 
    encoding: 'utf8',
    timeout: 30000 // 30 saniye timeout
  })
  
  console.log(`📄 Yanıt alındı (${result.length} karakter)`)
  
  let profilesData
  if (result && result.trim()) {
    profilesData = JSON.parse(result)
  } else {
    profilesData = []
    console.log('ℹ️  Profiles tablosu boş veya yanıt yok')
  }
  
  // 4. Diğer tabloları da dene
  const tables = {
    profiles: profilesData
  }
  
  // Diğer tablolar için de dene
  const otherTables = ['tryon_history', 'credits', 'sessions']
  
  for (const table of otherTables) {
    try {
      console.log(`\n🔍 ${table} tablosu kontrol ediliyor...`)
      const tableCommand = `curl -s -X GET "${SUPABASE_URL}/rest/v1/${table}?select=*" -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}"`
      
      const tableResult = execSync(tableCommand, { encoding: 'utf8' })
      
      if (tableResult && tableResult.trim()) {
        tables[table] = JSON.parse(tableResult)
        console.log(`✅ ${table}: ${tables[table].length} kayıt`)
      } else {
        tables[table] = []
        console.log(`ℹ️  ${table}: Boş veya yok`)
      }
    } catch (error) {
      tables[table] = []
      console.log(`⚠️  ${table}: Erişilemedi (muhtemelen tablo yok)`)
    }
  }
  
  // 5. Backup verisini hazırla
  const backupData = {
    metadata: {
      timestamp: now.toISOString(),
      project: "mert-app",
      backup_type: "supabase",
      version: "1.0"
    },
    tables: Object.keys(tables).filter(table => tables[table].length > 0),
    data: tables
  }
  
  // 6. Dosyaya yaz
  fs.writeFileSync(
    backupFile,
    JSON.stringify(backupData, null, 2),
    'utf8'
  )
  
  const fileSize = fs.statSync(backupFile).size
  const totalRecords = Object.values(tables).reduce((sum, data) => sum + data.length, 0)
  
  console.log('\n' + '='.repeat(50))
  console.log('🎉 BACKUP BAŞARILI!')
  console.log('='.repeat(50))
  console.log(`📁 Dosya: ${backupFile}`)
  console.log(`📏 Boyut: ${(fileSize / 1024).toFixed(2)} KB`)
  console.log(`📊 Toplam kayıt: ${totalRecords}`)
  console.log(`🗃️  Tablolar: ${backupData.tables.join(', ') || 'Hiçbir tabloda kayıt yok'}`)
  console.log('='.repeat(50))
  
  // 7. Eski backup'ları temizle
  cleanupOldBackups(backupDir)
  
} catch (error) {
  console.error('\n❌ HATA:', error.message)
  
  if (error.message.includes('401')) {
    console.log('\n🔐 HATA: 401 Unauthorized')
    console.log('💡 Service Role Key geçersiz!')
    console.log('1. Supabase Dashboard > Settings > API')
    console.log('2. Service Role Key\'ini kontrol et')
    console.log('3. Key süresi dolmuş olabilir')
  } else if (error.message.includes('timeout')) {
    console.log('\n⏰ HATA: Timeout')
    console.log('💡 İnternet bağlantını kontrol et')
  } else if (error.message.includes('JSON')) {
    console.log('\n📄 HATA: JSON parse hatası')
    console.log('💡 Supabase farklı yanıt veriyor')
    console.log('Manuel test için:')
    console.log(`curl -X GET "${SUPABASE_URL}/rest/v1/profiles?select=*" -H "apikey: ${SERVICE_KEY}"`)
  }
  
  process.exit(1)
}

function cleanupOldBackups(backupDir, daysToKeep = 7) {
  try {
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
  } catch (error) {
    console.log('⚠️  Eski backup temizleme hatası:', error.message)
  }
}

console.log('\n✅ Script tamamlandı!')