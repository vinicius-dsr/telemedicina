'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
            </div>
            <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
  )
}
