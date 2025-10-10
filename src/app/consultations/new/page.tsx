'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  Stethoscope,
  User,
  CheckCircle
} from 'lucide-react'
import { format, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Doctor {
  id: string
  name: string
  email: string
  specialty?: string
}

interface AlternativeDoctor {
  id: string
  name: string
}

export default function NewConsultationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [alternativeDoctors, setAlternativeDoctors] = useState<AlternativeDoctor[]>([])
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    doctorId: '',
    duration: '30',
    time: ''
  })

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchDoctors()
    checkSubscription()
  }, [session, router])

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current')
      if (response.ok) {
        const data = await response.json()
        setHasActiveSubscription(data.subscription?.status === 'ACTIVE')
      } else {
        setHasActiveSubscription(false)
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error)
      setHasActiveSubscription(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.doctors || [])
      }
    } catch (error) {
      console.error('Erro ao carregar médicos:', error)
      toast.error('Erro ao carregar lista de médicos')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !formData.time) {
      toast.error('Por favor, selecione uma data e horário')
      return
    }

    if (!formData.title || !formData.description || !formData.doctorId) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)

    try {
      // Combinar data e hora
      const [hours, minutes] = formData.time.split(':')
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          doctorId: formData.doctorId,
          scheduledAt: scheduledAt.toISOString(),
          duration: parseInt(formData.duration)
        }),
      })

      if (response.ok) {
        toast.success('Consulta agendada com sucesso!')
        router.push('/consultations')
      } else {
        const error = await response.json()
        
        // Verificar se há médicos alternativos disponíveis
        if (error.availableAlternatives && error.availableAlternatives.length > 0) {
          setAlternativeDoctors(error.availableAlternatives)
          setShowAlternatives(true)
          toast.error(error.error || 'Médico não disponível', {
            description: error.message,
            duration: 5000
          })
        } else {
          toast.error(error.error || error.message || 'Erro ao agendar consulta')
        }
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      toast.error('Erro ao agendar consulta')
    } finally {
      setIsLoading(false)
    }
  }

  // Gerar horários disponíveis (8h às 18h, de 30 em 30 minutos)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Stethoscope className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Agendar Nova Consulta</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Aviso de assinatura inativa */}
        {hasActiveSubscription === false && (
          <Card className="mb-6 border-orange-300 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Assinatura Necessária</CardTitle>
              <CardDescription className="text-orange-700">
                Você precisa de uma assinatura ativa para agendar consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/plans')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Ver Planos Disponíveis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Médicos alternativos disponíveis */}
        {showAlternatives && alternativeDoctors.length > 0 && (
          <Card className="mb-6 border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Médicos Disponíveis Neste Horário
              </CardTitle>
              <CardDescription className="text-blue-700">
                O médico selecionado não está disponível, mas temos outras opções para você
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alternativeDoctors.map((altDoctor) => (
                  <div 
                    key={altDoctor.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{altDoctor.name}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleInputChange('doctorId', altDoctor.id)
                        setShowAlternatives(false)
                        setAlternativeDoctors([])
                        toast.success(`Médico alterado para ${altDoctor.name}`)
                      }}
                    >
                      Selecionar
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setShowAlternatives(false)
                  setAlternativeDoctors([])
                }}
              >
                Escolher Outro Horário
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Informações da Consulta
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para agendar sua consulta médica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título da Consulta */}
              <div className="space-y-2">
                <Label htmlFor="title">Título da Consulta *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Consulta de rotina, Dor de cabeça..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição dos Sintomas *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seus sintomas ou o motivo da consulta..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Seleção do Médico */}
              <div className="space-y-2">
                <Label>Médico *</Label>
                <Select value={formData.doctorId} onValueChange={(value) => handleInputChange('doctorId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            {doctor.specialty && (
                              <div className="text-sm text-gray-500">{doctor.specialty}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seleção de Data */}
                <div className="space-y-2">
                  <Label>Data da Consulta *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date: Date) => date < startOfToday() || date.getDay() === 0 || date.getDay() === 6}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Seleção de Horário */}
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label>Duração Estimada</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resumo da Consulta */}
              {selectedDate && formData.time && formData.doctorId && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resumo do Agendamento
                  </h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Data:</strong> {format(selectedDate, "PPP", { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {formData.time}</p>
                    <p><strong>Duração:</strong> {formData.duration} minutos</p>
                    <p><strong>Médico:</strong> {doctors.find(d => d.id === formData.doctorId)?.name}</p>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || hasActiveSubscription === false}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Agendando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {hasActiveSubscription === false ? 'Assinatura Necessária' : 'Agendar Consulta'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}