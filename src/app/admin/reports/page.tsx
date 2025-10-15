'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { FileText } from 'lucide-react'

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  type UserWithRole = { name?: string; role?: string }
  const user = session?.user as UserWithRole | undefined

  useEffect(() => {
    if (status === 'loading') return
    const role = user?.role
    if (!session) { router.push('/auth/login'); return }
    if (role !== 'ADMIN') { router.push('/dashboard'); return }
  }, [session, status, router, user?.role])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="ADMIN" userName={session?.user?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-6 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Relatórios</h1>
          </div>
        <Card className="bg-background dark:bg-muted border-border">
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
    </div>
  )
}
