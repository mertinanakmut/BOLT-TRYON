// app/admin/backups/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { Download, Trash2, RotateCcw } from 'lucide-react'

interface Backup {
  name: string
  path: string
  size: string
  date: Date
  type: 'database' | 'files'
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(false)

  const loadBackups = async () => {
    const res = await fetch('/api/admin/backups')
    const data = await res.json()
    setBackups(data.backups)
  }

  const createBackup = async (type: 'database' | 'files') => {
    setLoading(true)
    await fetch(`/api/admin/backups?type=${type}`, { method: 'POST' })
    await loadBackups()
    setLoading(false)
  }

  useEffect(() => {
    loadBackups()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Backup Yönetimi</h1>
        <div className="space-x-2">
          <Button onClick={() => createBackup('database')} disabled={loading}>
            Veritabanı Yedeği Al
          </Button>
          <Button onClick={() => createBackup('files')} disabled={loading} variant="outline">
            Kod Yedeği Al
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Yedekler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Boyut</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.path}>
                  <TableCell>{backup.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${backup.type === 'database' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {backup.type === 'database' ? 'Veritabanı' : 'Dosyalar'}
                    </span>
                  </TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{format(backup.date, 'dd.MM.yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}