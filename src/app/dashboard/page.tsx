'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/Sidebar'
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  Clock,
  Plus,
  User
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} userName={user?.name ?? 'Usuário'} />
      
      <div className="lg:pl-64 xl:pl-72 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Subscription Status */}
        {subscription ? (
          <Card className="mb-6 sm:mb-8 bg-background dark:bg-muted border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Seu Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">{subscription.plan.name}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">R$ {subscription.plan.price}/mês</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Válido até {new Date(subscription.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge 
                  variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}
                  className="self-start sm:self-center"
                >
                  {subscription.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 sm:mb-8 border-destructive/30 bg-destructive/10 dark:bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-destructive">Nenhum plano ativo</CardTitle>
              <CardDescription className="text-sm text-destructive/80">
                Você precisa de um plano para agendar consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plans">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto">
                  Ver Planos
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-foreground">
                Agendar Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <Link href="/consultations/new" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto text-xs">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Nova
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-foreground">
                Minhas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                <Link href="/consultations" className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                    Ver todas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-foreground">
                Prontuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <Link href="/medical-records" className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                    Acessar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-foreground">
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
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
        <Card className="bg-background dark:bg-muted border-border">
          <CardHeader>
            <CardTitle>Consultas Recentes</CardTitle>
            <CardDescription>
              Suas consultas mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consultations.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {consultations.slice(0, 3).map((consultation) => (
                  <div key={consultation.id} className="flex flex-col gap-2 p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 dark:hover:bg-muted transition-colors bg-background dark:bg-card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">{consultation.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(consultation.scheduledAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 ml-2" />
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(consultation.scheduledAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          consultation.status === 'COMPLETED' ? 'default' :
                          consultation.status === 'SCHEDULED' ? 'secondary' :
                          'destructive'
                        }
                        className="text-xs self-start sm:self-center"
                      >
                        {consultation.status === 'COMPLETED' ? 'Concluída' :
                         consultation.status === 'SCHEDULED' ? 'Agendada' :
                         consultation.status === 'CANCELLED' ? 'Cancelada' : 'Em andamento'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Stethoscope className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-sm sm:text-base mb-2">Nenhuma consulta encontrada</p>
                <Link href="/consultations/new" className="inline-block">
                  <Button className="mt-4 w-full sm:w-auto">
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
    </div>
  )
}
