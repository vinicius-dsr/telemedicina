'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    const role = session?.user?.role
    if (!session) { router.push('/auth/login'); return }
    if (role !== 'ADMIN') { router.push('/dashboard'); return }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            </div>
            <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Gerar Relatórios</CardTitle>
            <CardDescription>Em breve: seleção de período e tipos de relatório</CardDescription>
          </CardHeader>
          <CardContent>
            Ferramentas de geração de relatórios serão disponibilizadas aqui.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
