# 1. Test utils oluştur
cat > lib/test-utils.ts << 'EOF'
export const formatDate = (date: Date | string): string => {
  if (!date) return 'Invalid Date'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Date'
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch { return 'Invalid Date' }
}

export const validateEmail = (email: string): boolean => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
EOF

# 2. Test dosyalarını oluştur
# Yukarıdaki test dosyalarını __tests__ klasörüne kopyala