// scripts/backup-files.js
const fs = require('fs-extra')
const path = require('path')
const archiver = require('archiver')
const { execSync } = require('child_process')

async function backupFiles() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backups', 'files')
  const backupFile = path.join(backupDir, `code-backup-${timestamp}.zip`)
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  console.log('📁 Dosyalar yedekleniyor...')
  
  const output = fs.createWriteStream(backupFile)
  const archive = archiver('zip', { zlib: { level: 9 } })
  
  output.on('close', () => {
    console.log(`✅ Kod yedeği oluşturuldu: ${backupFile} (${archive.pointer()} bytes)`)
    cleanupOldBackups(backupDir, 7) // 7 gün
  })
  
  archive.on('error', (err) => {
    throw err
  })
  
  archive.pipe(output)
  
  // Önemli dosyaları ekle
  archive.directory('app/', 'app')
  archive.directory('components/', 'components')
  archive.directory('lib/', 'lib')
  archive.directory('public/', 'public')
  
  // Config dosyaları
  archive.file('package.json', { name: 'package.json' })
  archive.file('next.config.js', { name: 'next.config.js' })
  archive.file('tsconfig.json', { name: 'tsconfig.json' })
  archive.file('tailwind.config.ts', { name: 'tailwind.config.ts' })
  
  // .env.example (gerçek .env.local değil!)
  if (fs.existsSync('.env.example')) {
    archive.file('.env.example', { name: '.env.example' })
  }
  
  // Git bilgisi
  try {
    const gitInfo = execSync('git log -1 --pretty=format:"%H|%an|%ad|%s"').toString()
    archive.append(gitInfo, { name: 'git-info.txt' })
  } catch (e) {
    console.log('ℹ️  Git info alınamadı')
  }
  
  await archive.finalize()
}

function cleanupOldBackups(backupDir, daysToKeep) {
  const files = fs.readdirSync(backupDir)
  const now = Date.now()
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000
  
  files.forEach(file => {
    if (file.endsWith('.zip')) {
      const filePath = path.join(backupDir, file)
      const stat = fs.statSync(filePath)
      
      if (now - stat.mtimeMs > maxAge) {
        fs.unlinkSync(filePath)
        console.log(`🗑️  Eski kod yedeği silindi: ${file}`)
      }
    }
  })
}

backupFiles()