// scripts/restore-backup.js
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, serviceKey)

async function restoreBackup(backupFile) {
  if (!backupFile) {
    // En son yedeği bul
    const backupDir = path.join(process.cwd(), 'backups', 'database')
    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
    
    if (files.length === 0) {
      console.error('❌ Yedek dosyası bulunamadı!')
      return
    }
    
    backupFile = path.join(backupDir, files[0])
    console.log(`🔍 En son yedek bulundu: ${files[0]}`)
  }
  
  console.log(`🔄 Geri yükleme başlıyor: ${backupFile}`)
  
  try {
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    
    for (const [table, records] of Object.entries(backupData.data)) {
      if (!records || records.length === 0) continue
      
      console.log(`📥 ${table} tablosuna ${records.length} kayıt yükleniyor...`)
      
      // Batch insert (100 kayıtta bir)
      const batchSize = 100
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize)
        
        const { error } = await supabase
          .from(table)
          .upsert(batch, { onConflict: 'id' })
        
        if (error) {
          console.error(`❌ ${table} batch ${i} hata:`, error.message)
        } else {
          console.log(`✅ ${table}: ${i + batch.length}/${records.length}`)
        }
      }
    }
    
    console.log('🎉 Geri yükleme tamamlandı!')
  } catch (error) {
    console.error('❌ Geri yükleme hatası:', error)
  }
}

// Kullanım: node scripts/restore-backup.js [backup-file]
const backupFile = process.argv[2]
restoreBackup(backupFile)