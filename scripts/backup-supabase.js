// scripts/backup-supabase.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Supabase credentials missing!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backups', 'database')
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`)
  
  // Klasör oluştur
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  console.log('📦 Veritabanı yedekleniyor...')
  
  try {
    // 1. Tüm tabloları al
    const tables = ['profiles', 'tryon_history', 'credits', 'sessions']
    const backupData = {}
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(10000) // Limit koy
    
      if (error) {
        console.error(`❌ ${table} yedeklenemedi:`, error.message)
      } else {
        backupData[table] = data
        console.log(`✅ ${table}: ${data?.length || 0} kayıt`)
      }
    }
    
    // 2. Dosyaya yaz
    fs.writeFileSync(
      backupFile,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        tables: Object.keys(backupData),
        data: backupData
      }, null, 2)
    )
    
    console.log(`✅ Yedek oluşturuldu: ${backupFile}`)
    
    // 3. Eski yedekleri temizle (30 günden eski)
    cleanupOldBackups(backupDir, 30)
    
    return backupFile
  } catch (error) {
    console.error('❌ Yedekleme hatası:', error)
    process.exit(1)
  }
}

function cleanupOldBackups(backupDir, daysToKeep = 30) {
  const files = fs.readdirSync(backupDir)
  const now = Date.now()
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000
  
  files.forEach(file => {
    const filePath = path.join(backupDir, file)
    const stat = fs.statSync(filePath)
    
    if (now - stat.mtimeMs > maxAge) {
      fs.unlinkSync(filePath)
      console.log(`🗑️  Eski yedek silindi: ${file}`)
    }
  })
}

// Çalıştır
backupDatabase()