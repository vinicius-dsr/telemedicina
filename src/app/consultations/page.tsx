'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
}

export default function ConsultationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchConsultations()
  }, [session, router])

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
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Agendada</Badge>
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
                {consultations.filter(c => c.status === 'SCHEDULED').length}
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
              <Card key={consultation.id} className="hover:shadow-md transition-shadow bg-background dark:bg-muted border-border">
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
                      {consultation.status === 'SCHEDULED' && (
                        <>
                          <Button size="sm" variant="outline">
                            Reagendar
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive/80 border-destructive/20 hover:bg-destructive/10">
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
    </div>
  )
}