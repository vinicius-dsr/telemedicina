'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
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

  const userWithRole = session?.user as { name?: string; role?: string } | undefined

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userWithRole?.role} userName={userWithRole?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-6 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Prontuário</h1>
          </div>
        {records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Nenhum registro encontrado.</CardContent>
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
                  <p className="text-muted-foreground mb-3">{r.description}</p>
                  {r.diagnosis && <p className="text-sm"><strong>Diagnóstico:</strong> {r.diagnosis}</p>}
                  {r.prescription && <p className="text-sm"><strong>Prescrição:</strong> {r.prescription}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
