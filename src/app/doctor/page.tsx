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
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Consultation {
  id: string
  title: string
  description: string
  status: string
  scheduledAt: string
  duration: number
  user: {
    id: string
    name: string
    email: string
  }
}

export default function DoctorDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  type UserWithRole = { name?: string; role?: string }
  const user = session?.user as UserWithRole | undefined
  const userRole = user?.role

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/consultations')
      
      if (response.ok) {
        const data = await response.json()
        setConsultations(data.consultations)
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmConsultation = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}/confirm`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Consulta confirmada com sucesso!')
        fetchConsultations() // Recarregar lista
      } else {
        toast.error(data.error || 'Erro ao confirmar consulta')
      }
    } catch (error) {
      console.error('Erro ao confirmar consulta:', error)
      toast.error('Erro ao confirmar consulta')
    }
  }

  const handleRejectConsultation = async (consultationId: string) => {
    const reason = prompt('Motivo da rejeição (opcional):')
    
    try {
      const response = await fetch(`/api/consultations/${consultationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Consulta rejeitada')
        fetchConsultations() // Recarregar lista
      } else {
        toast.error(data.error || 'Erro ao rejeitar consulta')
      }
    } catch (error) {
      console.error('Erro ao rejeitar consulta:', error)
      toast.error('Erro ao rejeitar consulta')
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    if (userRole !== 'DOCTOR') {
      router.push('/dashboard')
      return
    }

    fetchConsultations()
  }, [status, session, userRole, router])

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

  if (!session || userRole !== 'DOCTOR') {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingConsultations = consultations.filter(c => {
    const consultDate = new Date(c.scheduledAt)
    return consultDate >= today && c.status === 'SCHEDULED'
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const todayConsultations = upcomingConsultations.filter(c => {
    const consultDate = new Date(c.scheduledAt)
    consultDate.setHours(0, 0, 0, 0)
    return consultDate.getTime() === today.getTime()
  })

  const completedCount = consultations.filter(c => c.status === 'COMPLETED').length
  const scheduledCount = consultations.filter(c => c.status === 'SCHEDULED').length
  const pendingCount = consultations.filter(c => c.status === 'PENDING_CONFIRMATION').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return <Badge className="bg-yellow-500">Aguardando Confirmação</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-green-500">Confirmada</Badge>
      case 'COMPLETED':
        return <Badge variant="default">Concluída</Badge>
      case 'SCHEDULED':
        return <Badge variant="secondary">Agendada</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500">Em andamento</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelada</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejeitada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole="DOCTOR" userName={user?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Alerta de Consultas Pendentes */}
        {pendingCount > 0 && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-900">
                <AlertCircle className="h-5 w-5 mr-2" />
                {pendingCount} Consulta{pendingCount > 1 ? 's' : ''} Aguardando Confirmação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-800 text-sm">
                Você tem consultas pendentes que precisam ser confirmadas ou rejeitadas. 
                Verifique a lista abaixo e tome uma ação.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card className={pendingCount > 0 ? 'border-yellow-300' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </div>
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Consultas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-3xl font-bold text-blue-600">
                  {todayConsultations.length}
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-3xl font-bold text-orange-600">
                  {scheduledCount}
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-3xl font-bold text-green-600">
                  {completedCount}
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Consultations */}
        {todayConsultations.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Consultas de Hoje</CardTitle>
              <CardDescription className="text-blue-700">
                Suas consultas agendadas para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayConsultations.map((consultation) => (
                  <div key={consultation.id} className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <h4 className="font-semibold text-gray-900">{consultation.user.name}</h4>
                        </div>
                        <h3 className="font-medium text-lg mb-1">{consultation.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{consultation.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(consultation.scheduledAt).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span>{consultation.duration} minutos</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(consultation.status)}
                        {consultation.status === 'PENDING_CONFIRMATION' && (
                          <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-xs w-full sm:w-auto"
                              onClick={() => handleConfirmConsultation(consultation.id)}
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs w-full sm:w-auto"
                              onClick={() => handleRejectConsultation(consultation.id)}
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Consultas</CardTitle>
            <CardDescription>
              Histórico completo de consultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{consultation.user.name}</span>
                        <span className="text-sm text-gray-500">({consultation.user.email})</span>
                      </div>
                      <h4 className="font-medium mb-1">{consultation.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{consultation.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(consultation.scheduledAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(consultation.scheduledAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span>{consultation.duration} min</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end ml-4">
                      {getStatusBadge(consultation.status)}
                      {consultation.status === 'PENDING_CONFIRMATION' && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-xs w-full sm:w-auto"
                            onClick={() => handleConfirmConsultation(consultation.id)}
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs w-full sm:w-auto"
                            onClick={() => handleRejectConsultation(consultation.id)}
                          >
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhuma consulta encontrada</p>
                <p className="text-sm">Você ainda não tem consultas agendadas</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
