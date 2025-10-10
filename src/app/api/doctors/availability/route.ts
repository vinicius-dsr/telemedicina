import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Verificar disponibilidade de médicos para uma data/hora específica
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { scheduledAt, duration, doctorId } = await request.json()

    if (!scheduledAt || !duration) {
      return NextResponse.json(
        { error: 'Data/hora e duração são obrigatórios' },
        { status: 400 }
      )
    }

    const requestedDate = new Date(scheduledAt)
    const consultationDuration = parseInt(duration)

    // Buscar todos os médicos
    const allDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (allDoctors.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum médico disponível no momento' },
        { status: 404 }
      )
    }

    // Verificar disponibilidade de cada médico
    const availabilityChecks = await Promise.all(
      allDoctors.map(async (doctor) => {
        // Buscar consultas conflitantes
        const conflictingConsultations = await prisma.consultation.findMany({
          where: {
            doctorId: doctor.id,
            status: {
              in: ['SCHEDULED', 'IN_PROGRESS']
            },
            scheduledAt: {
              gte: new Date(requestedDate.getTime() - 60 * 60 * 1000), // 1 hora antes
              lte: new Date(requestedDate.getTime() + consultationDuration * 60 * 1000 + 60 * 60 * 1000) // duração + 1 hora depois
            }
          },
          select: {
            scheduledAt: true,
            duration: true
          }
        })

        // Verificar se há conflito real considerando a duração
        const hasConflict = conflictingConsultations.some((consultation) => {
          const consultationStart = new Date(consultation.scheduledAt).getTime()
          const consultationEnd = consultationStart + (consultation.duration * 60 * 1000)
          const requestedStart = requestedDate.getTime()
          const requestedEnd = requestedStart + (consultationDuration * 60 * 1000)

          // Verifica se há sobreposição de horários
          return (
            (requestedStart >= consultationStart && requestedStart < consultationEnd) ||
            (requestedEnd > consultationStart && requestedEnd <= consultationEnd) ||
            (requestedStart <= consultationStart && requestedEnd >= consultationEnd)
          )
        })

        return {
          doctor: {
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            specialty: 'Clínico Geral' // Pode ser expandido futuramente
          },
          available: !hasConflict,
          nextAvailableSlot: hasConflict ? await findNextAvailableSlot(doctor.id, requestedDate, consultationDuration) : null
        }
      })
    )

    // Separar médicos disponíveis e indisponíveis
    const availableDoctors = availabilityChecks.filter(check => check.available)
    const unavailableDoctors = availabilityChecks.filter(check => !check.available)

    // Se um médico específico foi solicitado, verificar sua disponibilidade
    let requestedDoctorStatus = null
    if (doctorId) {
      requestedDoctorStatus = availabilityChecks.find(check => check.doctor.id === doctorId)
    }

    return NextResponse.json({
      requestedDateTime: scheduledAt,
      duration: consultationDuration,
      totalDoctors: allDoctors.length,
      availableDoctors: availableDoctors.map(check => check.doctor),
      unavailableDoctors: unavailableDoctors.map(check => ({
        doctor: check.doctor,
        nextAvailableSlot: check.nextAvailableSlot
      })),
      requestedDoctor: requestedDoctorStatus ? {
        ...requestedDoctorStatus.doctor,
        available: requestedDoctorStatus.available,
        nextAvailableSlot: requestedDoctorStatus.nextAvailableSlot
      } : null,
      hasAvailability: availableDoctors.length > 0
    })

  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para encontrar próximo horário disponível
async function findNextAvailableSlot(doctorId: string, startDate: Date, duration: number) {
  const maxDaysToCheck = 7 // Verificar próximos 7 dias
  const slotsPerDay = 20 // 8h às 18h, slots de 30min

  for (let day = 0; day < maxDaysToCheck; day++) {
    const checkDate = new Date(startDate)
    checkDate.setDate(checkDate.getDate() + day)
    checkDate.setHours(8, 0, 0, 0) // Começar às 8h

    for (let slot = 0; slot < slotsPerDay; slot++) {
      const slotTime = new Date(checkDate)
      slotTime.setMinutes(slotTime.getMinutes() + (slot * 30))

      // Pular finais de semana
      if (slotTime.getDay() === 0 || slotTime.getDay() === 6) {
        continue
      }

      // Verificar se este horário está livre
      const conflicts = await prisma.consultation.findFirst({
        where: {
          doctorId,
          status: {
            in: ['SCHEDULED', 'IN_PROGRESS']
          },
          scheduledAt: {
            gte: new Date(slotTime.getTime() - 30 * 60 * 1000),
            lte: new Date(slotTime.getTime() + duration * 60 * 1000)
          }
        }
      })

      if (!conflicts) {
        return slotTime.toISOString()
      }
    }
  }

  return null // Nenhum horário disponível nos próximos 7 dias
}
