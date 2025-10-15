'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/Sidebar'
import { 
  Users, 
  Stethoscope, 
  DollarSign, 
  TrendingUp,
  FileText,
  BarChart3
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeSubscriptions: number
  totalConsultations: number
  monthlyRevenue: number
  recentUsers: Array<{
    id: string
    name: string
    email: string
    createdAt: string
  }>
  recentConsultations: Array<{
    id: string
    title: string
    user: {
      name: string
    }
    status: string
    scheduledAt: string
  }>
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  type UserWithRole = { name?: string; role?: string }
  const user = session?.user as UserWithRole | undefined

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    const userRole = user?.role

    if (userRole !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchDashboardData()
  }, [session, status, router, user?.role])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const userRole = (session?.user as unknown as { role?: string })?.role

  if (!session || userRole !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="ADMIN" userName={session?.user?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Totais</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalConsultations || 0}</div>
              <p className="text-xs text-muted-foreground">
                +15% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats?.monthlyRevenue?.toLocaleString('pt-BR') || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                +20% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-background dark:bg-muted border-border" onClick={() => router.push('/admin/users')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-primary" />
                <Button size="sm" onClick={(e) => {
                  e.stopPropagation();
                  router.push('/admin/users');
                }}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Ver todos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Planos e Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <DollarSign className="h-8 w-8 text-green-600" />
                <a href="/admin/plans">
                  <Button size="sm" variant="outline">Gerenciar</Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Stethoscope className="h-8 w-8 text-purple-600" />
                <a href="/admin/consultations">
                  <Button size="sm" variant="outline">Ver todas</Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-orange-600" />
                <a href="/admin/reports">
                  <Button size="sm" variant="outline">Gerar</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader>
              <CardTitle>Usuários Recentes</CardTitle>
              <CardDescription>
                Novos usuários cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Consultations */}
          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader>
              <CardTitle>Consultas Recentes</CardTitle>
              <CardDescription>
                Últimas consultas agendadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentConsultations && stats.recentConsultations.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentConsultations.slice(0, 5).map((consultation) => (
                    <div key={consultation.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{consultation.title}</p>
                        <p className="text-sm text-muted-foreground">{consultation.user.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            consultation.status === 'COMPLETED' ? 'default' :
                            consultation.status === 'SCHEDULED' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {consultation.status === 'COMPLETED' ? 'Concluída' :
                           consultation.status === 'SCHEDULED' ? 'Agendada' :
                           consultation.status === 'CANCELLED' ? 'Cancelada' : 'Em andamento'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(consultation.scheduledAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p>Nenhuma consulta encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
