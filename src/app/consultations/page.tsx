'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Sidebar } from '@/components/Sidebar'
import { 
  Calendar,
  Clock,
  Plus,
  Stethoscope,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Consultation {
  id: string
  title: string
  description: string
  status: string
  scheduledAt: string
  duration: number
  notes?: string
  createdAt: string
  user?: {
    name?: string
    email?: string
  }
}

export default function ConsultationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [consultationToCancel, setConsultationToCancel] = useState<Consultation | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchConsultations()
  }, [session, router])

  useEffect(() => {
    const consultationId = searchParams.get('consultationId')
    if (!consultationId || consultations.length === 0) return

    const target = document.getElementById(`consultation-${consultationId}`)
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightedId(consultationId)
    const timeout = setTimeout(() => setHighlightedId(null), 2000)
    return () => clearTimeout(timeout)
  }, [consultations, searchParams])

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/consultations')
      if (response.ok) {
        const data = await response.json()
        setConsultations(data.consultations)
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
      toast.error('Erro ao carregar consultas')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Agendada</Badge>
      case 'PENDING_CONFIRMATION':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Em Andamento</Badge>
      case 'COMPLETED':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Concluída</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canCancelConsultation = (consultation: Consultation) => {
    const scheduledAt = new Date(consultation.scheduledAt).getTime()
    const minAdvanceMs = 3 * 60 * 60 * 1000
    return scheduledAt - Date.now() >= minAdvanceMs
  }

  const openCancelDialog = (consultation: Consultation) => {
    if (!canCancelConsultation(consultation)) {
      toast.error('Cancelamentos só são permitidos com pelo menos 3 horas de antecedência')
      return
    }
    setConsultationToCancel(consultation)
    setCancelReason('')
  }

  const closeCancelDialog = () => {
    setConsultationToCancel(null)
    setCancelReason('')
  }

  const handleCancelConsultation = async () => {
    if (!consultationToCancel) return
    const reason = cancelReason.trim()
    if (!reason) return

    try {
      setIsCancelling(true)
      const response = await fetch(`/api/consultations/${consultationToCancel.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao cancelar consulta')
      }

      toast.success('Consulta cancelada')
      closeCancelDialog()
      fetchConsultations()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cancelar consulta'
      toast.error(message)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleConfirmConsultation = async (consultationId: string) => {
    try {
      setConfirmingId(consultationId)
      const response = await fetch(`/api/consultations/${consultationId}/confirm`, {
        method: 'POST'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao confirmar consulta')
      }
      toast.success('Consulta confirmada')
      fetchConsultations()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao confirmar consulta'
      toast.error(message)
    } finally {
      setConfirmingId(null)
    }
  }

  const handleRejectConsultation = async (consultationId: string) => {
    const shouldReject = window.confirm('Deseja rejeitar esta consulta?')
    if (!shouldReject) return

    try {
      setRejectingId(consultationId)
      const response = await fetch(`/api/consultations/${consultationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '' })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao rejeitar consulta')
      }
      toast.success('Consulta rejeitada')
      fetchConsultations()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao rejeitar consulta'
      toast.error(message)
    } finally {
      setRejectingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando consultas...</p>
        </div>
      </div>
    )
  }

  const userWithRole = session?.user as { name?: string; role?: string } | undefined
  const isDoctor = userWithRole?.role === 'DOCTOR'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userWithRole?.role} userName={userWithRole?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Minhas Consultas</h1>
            <Link href="/consultations/new">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Agendar Consulta
              </Button>
            </Link>
          </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Consultas Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {consultations.filter(c => ['SCHEDULED', 'CONFIRMED'].includes(c.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Consultas Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {consultations.filter(c => c.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-muted border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Total de Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {consultations.length}
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Consultations List */}
          <div className="space-y-4">
          {consultations.length === 0 ? (
            <Card className="bg-background dark:bg-muted border-border">
              <CardContent className="text-center py-12">
                <Stethoscope className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma consulta encontrada
                </h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não possui consultas agendadas. Agende sua primeira consulta agora!
                </p>
                <Link href="/consultations/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Primeira Consulta
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            consultations.map((consultation) => (
              <Card
                key={consultation.id}
                id={`consultation-${consultation.id}`}
                className={`hover:shadow-md transition-shadow bg-background dark:bg-muted border-border ${
                  highlightedId === consultation.id ? 'ring-2 ring-primary/60' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {consultation.title}
                        </h3>
                        {getStatusBadge(consultation.status)}
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {consultation.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(consultation.scheduledAt)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {consultation.duration} minutos
                        </div>
                      </div>

                      {consultation.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center mb-1">
                            <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Observações:</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {isDoctor && consultation.status === 'PENDING_CONFIRMATION' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmConsultation(consultation.id)}
                            disabled={confirmingId === consultation.id || rejectingId === consultation.id}
                          >
                            {confirmingId === consultation.id ? 'Confirmando...' : 'Confirmar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive/80 border-destructive/20 hover:bg-destructive/10"
                            onClick={() => handleRejectConsultation(consultation.id)}
                            disabled={confirmingId === consultation.id || rejectingId === consultation.id}
                          >
                            {rejectingId === consultation.id ? 'Rejeitando...' : 'Rejeitar'}
                          </Button>
                        </>
                      )}
                      {!isDoctor && ['SCHEDULED', 'CONFIRMED', 'PENDING_CONFIRMATION'].includes(consultation.status) && (
                        <>
                          <Button size="sm" variant="outline">
                            Reagendar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive/80 border-destructive/20 hover:bg-destructive/10"
                            onClick={() => openCancelDialog(consultation)}
                            disabled={!canCancelConsultation(consultation)}
                            title={!canCancelConsultation(consultation) ? 'Disponível apenas com 3h de antecedência' : undefined}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {consultation.status === 'COMPLETED' && (
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </div>
      </div>

      <Dialog open={!!consultationToCancel} onOpenChange={(open) => !open && closeCancelDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar consulta</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento. Esse campo é obrigatório.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCancelDialog} disabled={isCancelling}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConsultation}
              disabled={isCancelling || cancelReason.trim().length === 0}
            >
              {isCancelling ? 'Cancelando...' : 'Confirmar cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
