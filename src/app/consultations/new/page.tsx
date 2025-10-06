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
import { Calendar, Clock, Stethoscope, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function NewConsultationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: '30',
    urgency: 'normal'
  })

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
          duration: parseInt(formData.duration),
          urgency: formData.urgency
        })
      })

      if (response.ok) {
        toast.success('Consulta agendada com sucesso!')
        router.push('/dashboard')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao agendar consulta')
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      toast.error('Erro ao agendar consulta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Gerar opções de horário para os próximos 30 dias
  const generateTimeSlots = () => {
    const slots = []
    const now = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)
      
      // Horários disponíveis: 8h às 18h, de hora em hora
      for (let hour = 8; hour <= 18; hour++) {
        const slotDate = new Date(date)
        slotDate.setHours(hour, 0, 0, 0)
        
        slots.push({
          value: slotDate.toISOString(),
          label: `${date.toLocaleDateString('pt-BR')} às ${hour.toString().padStart(2, '0')}:00`
        })
      }
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Agendar Consulta</h1>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Nova Consulta</CardTitle>
                <CardDescription>
                  Preencha os dados para agendar sua consulta médica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Consulta</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Consulta de rotina, Dor de cabeça, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição dos Sintomas</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Descreva seus sintomas, histórico médico relevante, medicamentos em uso, etc."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Data e Horário</Label>
                      <Select
                        value={formData.scheduledAt}
                        onValueChange={(value) => handleSelectChange('scheduledAt', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione data e horário" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (minutos)</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => handleSelectChange('duration', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="45">45 minutos</SelectItem>
                          <SelectItem value="60">60 minutos</SelectItem>
                          <SelectItem value="90">90 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgência</Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) => handleSelectChange('urgency', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa - Consulta de rotina</SelectItem>
                        <SelectItem value="normal">Normal - Sintomas moderados</SelectItem>
                        <SelectItem value="high">Alta - Sintomas preocupantes</SelectItem>
                        <SelectItem value="urgent">Urgente - Emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Agendando...' : 'Agendar Consulta'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Horário de Funcionamento</p>
                    <p className="text-sm text-gray-600">
                      Segunda a Sexta: 8h às 18h<br />
                      Sábado: 8h às 12h
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Stethoscope className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Preparação</p>
                    <p className="text-sm text-gray-600">
                      Tenha em mãos seus documentos e lista de medicamentos
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Emergências</p>
                    <p className="text-sm text-gray-600">
                      Para emergências, procure atendimento presencial imediatamente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                    <span>Confirme o agendamento</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                    <span>Receba confirmação por email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                    <span>Acesse o link da consulta no horário agendado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                    <span>Receba o prontuário após a consulta</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
