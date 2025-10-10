'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Stethoscope, User, Calendar, Clock, Filter } from 'lucide-react'

interface Doctor {
  id: string
  name: string
  email: string
}

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
  doctor: {
    id: string
    name: string
    email: string
  } | null
}

export default function AdminConsultationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  type UserWithRole = { name?: string; role?: string }
  const user = session?.user as UserWithRole | undefined

  useEffect(() => {
    if (status === 'loading') return
    const role = user?.role
    if (!session) { router.push('/auth/login'); return }
    if (role !== 'ADMIN') { router.push('/dashboard'); return }
    
    fetchData()
  }, [session, status, router, user?.role])

  const fetchData = async () => {
    try {
      const [consultationsRes, doctorsRes] = await Promise.all([
        fetch('/api/admin/consultations'),
        fetch('/api/doctors')
      ])

      if (consultationsRes.ok) {
        const data = await consultationsRes.json()
        setConsultations(data.consultations || [])
      }

      if (doctorsRes.ok) {
        const data = await doctorsRes.json()
        setDoctors(data.doctors || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(consultation => {
    const matchesDoctor = selectedDoctor === 'all' || consultation.doctor?.id === selectedDoctor
    const matchesStatus = selectedStatus === 'all' || consultation.status === selectedStatus
    return matchesDoctor && matchesStatus
  })

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

  const consultationsByDoctor = doctors.map(doctor => ({
    doctor,
    count: consultations.filter(c => c.doctor?.id === doctor.id).length,
    pending: consultations.filter(c => c.doctor?.id === doctor.id && c.status === 'PENDING_CONFIRMATION').length,
    confirmed: consultations.filter(c => c.doctor?.id === doctor.id && c.status === 'CONFIRMED').length
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Consultas</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.back()}>Voltar</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas por Médico */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {consultationsByDoctor.map(({ doctor, count, pending, confirmed }) => (
            <Card key={doctor.id} className={pending > 0 ? 'border-yellow-300' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {doctor.name}
                  </span>
                  {pending > 0 && (
                    <Badge className="bg-yellow-500">{pending}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendentes:</span>
                    <span className="font-semibold text-yellow-600">{pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmadas:</span>
                    <span className="font-semibold text-green-600">{confirmed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Médico</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os médicos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os médicos</SelectItem>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="PENDING_CONFIRMATION">Aguardando Confirmação</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                    <SelectItem value="SCHEDULED">Agendada</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="COMPLETED">Concluída</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    <SelectItem value="REJECTED">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Consultas */}
        <Card>
          <CardHeader>
            <CardTitle>
              Consultas ({filteredConsultations.length})
            </CardTitle>
            <CardDescription>
              {selectedDoctor !== 'all' && `Médico: ${doctors.find(d => d.id === selectedDoctor)?.name}`}
              {selectedStatus !== 'all' && ` | Status: ${selectedStatus}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredConsultations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhuma consulta encontrada</p>
                <p className="text-sm">Tente ajustar os filtros</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConsultations.map(consultation => (
                  <div key={consultation.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg mb-1">{consultation.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{consultation.description}</p>
                      </div>
                      {getStatusBadge(consultation.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Paciente:</span>
                          <span>{consultation.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Médico:</span>
                          <span>{consultation.doctor?.name || 'Não atribuído'}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Data:</span>
                          <span>{new Date(consultation.scheduledAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Horário:</span>
                          <span>
                            {new Date(consultation.scheduledAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {' '}({consultation.duration} min)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
