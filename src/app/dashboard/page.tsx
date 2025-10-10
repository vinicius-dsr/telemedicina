'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  Clock,
  Plus,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: string
  status: string
  plan: {
    name: string
    price: number
  }
  endDate: string
}

interface Consultation {
  id: string
  title: string
  status: string
  scheduledAt: string
}
// Remove module augmentation here if you already have it in src/types/next-auth.d.ts
// declare module 'next-auth' {
//   interface User {
//     role?: string
//   }
//   interface Session {
//     user?: DefaultSession['user'] & { role?: string }
//   }
// }

export default function DashboardPage() {
  const { data: session, status } = useSession()

  // Type assertion to include 'role' and 'name' in session.user
  type UserWithRole = { name?: string; role?: string }
  const user = session?.user as UserWithRole | undefined
  const userRole = user?.role
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = async () => {
    try {
      const [subscriptionRes, consultationsRes] = await Promise.all([
        fetch('/api/subscriptions/current'),
        fetch('/api/consultations')
      ])

      if (subscriptionRes.ok) {
        const subData = await subscriptionRes.json()
        setSubscription(subData.subscription)
      }

      if (consultationsRes.ok) {
        const consData = await consultationsRes.json()
        setConsultations(consData.consultations)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      return
    }
    const userRole = user?.role

    if (userRole === 'ADMIN') {
      router.push('/admin')
      return
    }

    if (userRole === 'DOCTOR') {
      router.push('/doctor')
      return
    }

    fetchUserData()
  }, [status, router, userRole, session, user?.role])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="text-sm sm:text-base text-gray-700">Olá, {user?.name ?? 'Usuário'}</span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => router.push('/settings')} className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Configurações</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/auth/login' })} className="flex-1 sm:flex-none">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        {subscription ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Seu Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                  <p className="text-gray-600">R$ {subscription.plan.price}/mês</p>
                  <p className="text-sm text-gray-500">
                    Válido até {new Date(subscription.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge 
                  variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}
                >
                  {subscription.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Nenhum plano ativo</CardTitle>
              <CardDescription className="text-orange-700">
                Você precisa de um plano para agendar consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plans">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Ver Planos
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Agendar Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <Link href="/consultations/new" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto text-xs">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Nova
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Minhas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <Link href="/consultations" className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                    Ver todas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Prontuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                <Link href="/medical-records" className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                    Acessar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                <Link href="/history" className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                    Ver histórico
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas Recentes</CardTitle>
            <CardDescription>
              Suas consultas mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.slice(0, 3).map((consultation) => (
                  <div key={consultation.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm sm:text-base">{consultation.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {new Date(consultation.scheduledAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        consultation.status === 'COMPLETED' ? 'default' :
                        consultation.status === 'SCHEDULED' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {consultation.status === 'COMPLETED' ? 'Concluída' :
                       consultation.status === 'SCHEDULED' ? 'Agendada' :
                       consultation.status === 'CANCELLED' ? 'Cancelada' : 'Em andamento'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma consulta encontrada</p>
                <Link href="/consultations/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar primeira consulta
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
