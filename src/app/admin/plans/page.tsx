'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/Sidebar'
import { DollarSign, CheckCircle, Calendar } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: string[]
  isActive: boolean
}

export default function AdminPlansPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])

  type UserWithRole = { name?: string; role?: string }
  const user = session?.user as UserWithRole | undefined

  useEffect(() => {
    if (status === 'loading') return
    const role = user?.role
    if (!session) { router.push('/auth/login'); return }
    if (role !== 'ADMIN') { router.push('/dashboard'); return }
    fetchPlans()
  }, [session, status, router, user?.role])

  const fetchPlans = async () => {
    const res = await fetch('/api/plans')
    if (res.ok) {
      const data = await res.json()
      setPlans(data.plans || [])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole="ADMIN" userName={session?.user?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Planos</h1>
          </div>
        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum plano cadastrado</h3>
              <p className="text-gray-600 mb-4">Execute o seed do banco de dados para criar planos iniciais</p>
              <code className="bg-gray-100 px-4 py-2 rounded text-sm">npm run db:seed</code>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <Card key={p.id} className={p.isActive ? 'border-green-200' : 'border-gray-200'}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{p.name}</CardTitle>
                    <Badge variant={p.isActive ? 'default' : 'secondary'}>
                      {p.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      R$ {p.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {p.duration} dias
                    </div>
                  </div>
                  
                  {p.features && p.features.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recursos:</h4>
                      <ul className="space-y-1">
                        {p.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                        {p.features.length > 3 && (
                          <li className="text-sm text-gray-500 ml-6">
                            +{p.features.length - 3} mais recursos
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
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
