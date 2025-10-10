'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

interface MedicalRecord {
  id: string
  title: string
  description: string
  diagnosis?: string
  prescription?: string
  createdAt: string
}

export default function MedicalRecordsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/auth/login'); return }
    fetchRecords()
  }, [session, status, router])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/medical-records')
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
      }
    } catch {}
    finally { setIsLoading(false) }
  }

  if (isLoading) return null
  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Prontuário</h1>
            </div>
            <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-600">Nenhum registro encontrado.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle>{r.title}</CardTitle>
                  <CardDescription>
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{r.description}</p>
                  {r.diagnosis && <p className="text-sm"><strong>Diagnóstico:</strong> {r.diagnosis}</p>}
                  {r.prescription && <p className="text-sm"><strong>Prescrição:</strong> {r.prescription}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
