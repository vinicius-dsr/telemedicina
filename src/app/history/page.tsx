'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { Clock } from 'lucide-react'

interface HistoryItem {
  id: string
  title: string
  type: string
  createdAt: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/auth/login'); return }
    fetchHistory()
  }, [session, status, router])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history')
      if (res.ok) {
        const data = await res.json()
        setItems(data.history || [])
      }
    } catch {}
    finally { setIsLoading(false) }
  }

  if (isLoading) return null
  if (!session) return null

  const userWithRole = session?.user as { name?: string; role?: string } | undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={userWithRole?.role} userName={userWithRole?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-6 flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Histórico</h1>
          </div>
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-600">Nenhum item no histórico.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((h) => (
              <Card key={h.id}>
                <CardHeader>
                  <CardTitle>{h.title}</CardTitle>
                  <CardDescription>{new Date(h.createdAt).toLocaleString('pt-BR')}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
