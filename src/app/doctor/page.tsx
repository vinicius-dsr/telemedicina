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
  AlertCircle,
  CalendarPlus
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

  const handleCompleteConsultation = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}/complete`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Consulta marcada como concluída!')
        fetchConsultations()
      } else {
        toast.error(data.error || 'Erro ao concluir consulta')
      }
    } catch (error) {
      console.error('Erro ao concluir consulta:', error)
      toast.error('Erro ao concluir consulta')
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
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
    return consultDate >= today && ['SCHEDULED', 'CONFIRMED', 'PENDING_CONFIRMATION'].includes(c.status)
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const todayConsultations = upcomingConsultations.filter(c => {
    const consultDate = new Date(c.scheduledAt)
    consultDate.setHours(0, 0, 0, 0)
    return consultDate.getTime() === today.getTime()
  })

  const completedCount = consultations.filter(c => c.status === 'COMPLETED').length
  const scheduledCount = consultations.filter(c => ['SCHEDULED', 'CONFIRMED'].includes(c.status)).length
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

  const formatGoogleDate = (date: Date) => {
    const iso = date.toISOString().replace(/[-:]/g, '').split('.')[0]
    return `${iso}Z`
  }

  const getGoogleCalendarUrl = (consultation: Consultation) => {
    const start = new Date(consultation.scheduledAt)
    const end = new Date(start.getTime() + consultation.duration * 60 * 1000)
    const dates = `${formatGoogleDate(start)}/${formatGoogleDate(end)}`
    const text = `Consulta: ${consultation.title}`
    const details = `${consultation.description}\\nPaciente: ${consultation.user.name}\\nEmail: ${consultation.user.email}`
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&details=${encodeURIComponent(details)}&dates=${dates}`
  }

  const canAddToCalendar = (status: string) => ['CONFIRMED', 'SCHEDULED'].includes(status)
  const canCompleteConsultation = (status: string) => ['CONFIRMED', 'SCHEDULED', 'IN_PROGRESS'].includes(status)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="DOCTOR" userName={user?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Alerta de Consultas Pendentes */}
        {pendingCount > 0 && (
          <Card className="mb-4 sm:mb-6 border-amber-400/40 bg-amber-500/10">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center text-amber-800 dark:text-amber-300 text-sm sm:text-base">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span>{pendingCount} Consulta{pendingCount > 1 ? 's' : ''} Aguardando Confirmação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 dark:text-amber-200 text-xs sm:text-sm">
                Você tem consultas pendentes que precisam ser confirmadas ou rejeitadas. 
                Verifique a lista abaixo e tome uma ação.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card className={pendingCount > 0 ? 'border-amber-400/40' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
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
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
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
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
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
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
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
          <Card className="mb-8 border-primary/20 bg-primary/10">
            <CardHeader>
              <CardTitle className="text-primary">Consultas de Hoje</CardTitle>
              <CardDescription className="text-primary/80">
                Suas consultas agendadas para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayConsultations.map((consultation) => (
                  <div key={consultation.id} className="bg-card p-3 sm:p-4 rounded-lg border border-border">
                    <div className="flex flex-col gap-3">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="font-semibold text-sm sm:text-base text-foreground">{consultation.user.name}</h4>
                        </div>
                        {getStatusBadge(consultation.status)}
                      </div>
                      
                      {/* Content */}
                      <div>
                        <h3 className="font-medium text-base sm:text-lg mb-1">{consultation.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{consultation.description}</p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {new Date(consultation.scheduledAt).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span>{consultation.duration} minutos</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {(consultation.status === 'PENDING_CONFIRMATION' || canAddToCalendar(consultation.status) || canCompleteConsultation(consultation.status)) && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                          {consultation.status === 'PENDING_CONFIRMATION' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-xs w-full sm:flex-1"
                                onClick={() => handleConfirmConsultation(consultation.id)}
                              >
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs w-full sm:flex-1"
                                onClick={() => handleRejectConsultation(consultation.id)}
                              >
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                          {canAddToCalendar(consultation.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs w-full sm:flex-1"
                              onClick={() => window.open(getGoogleCalendarUrl(consultation), '_blank', 'noopener,noreferrer')}
                            >
                              <CalendarPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Google Calendar
                            </Button>
                          )}
                          {canCompleteConsultation(consultation.status) && (
                            <Button
                              size="sm"
                              variant="default"
                              className="text-xs w-full sm:flex-1"
                              onClick={() => handleCompleteConsultation(consultation.id)}
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Concluir
                            </Button>
                          )}
                        </div>
                      )}
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
                  <div key={consultation.id} className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Header with user info and status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground truncate">{consultation.user.name}</span>
                          <span className="text-xs sm:text-sm text-muted-foreground truncate">({consultation.user.email})</span>
                        </div>
                      </div>
                      {getStatusBadge(consultation.status)}
                    </div>
                    
                    {/* Consultation details */}
                    <div>
                      <h4 className="font-medium text-sm sm:text-base mb-1">{consultation.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{consultation.description}</p>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {new Date(consultation.scheduledAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {new Date(consultation.scheduledAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span>{consultation.duration} min</span>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    {(consultation.status === 'PENDING_CONFIRMATION' || canAddToCalendar(consultation.status) || canCompleteConsultation(consultation.status)) && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                        {consultation.status === 'PENDING_CONFIRMATION' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-xs w-full sm:flex-1"
                              onClick={() => handleConfirmConsultation(consultation.id)}
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs w-full sm:flex-1"
                              onClick={() => handleRejectConsultation(consultation.id)}
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {canAddToCalendar(consultation.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs w-full sm:flex-1"
                            onClick={() => window.open(getGoogleCalendarUrl(consultation), '_blank', 'noopener,noreferrer')}
                          >
                            <CalendarPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Google Calendar
                          </Button>
                        )}
                        {canCompleteConsultation(consultation.status) && (
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs w-full sm:flex-1"
                            onClick={() => handleCompleteConsultation(consultation.id)}
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Stethoscope className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-base sm:text-lg font-medium mb-2">Nenhuma consulta encontrada</p>
                <p className="text-xs sm:text-sm">Você ainda não tem consultas agendadas</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
