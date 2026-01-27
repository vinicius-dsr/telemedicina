import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sessionUser = session.user
    const userRole = (sessionUser as { role?: string })?.role

    // Se for médico, retorna consultas onde ele é o médico
    if (userRole === 'DOCTOR') {
      const consultations = await prisma.consultation.findMany({
        where: { doctorId: sessionUser.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { scheduledAt: 'desc' }
      })

      return NextResponse.json({ consultations })
    }

    // Se for paciente, retorna consultas onde ele é o paciente
    const consultations = await prisma.consultation.findMany({
      where: { userId: sessionUser.id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    })

    return NextResponse.json({ consultations })
  } catch (error) {
    console.error('Erro ao buscar consultas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { title, description, doctorId, scheduledAt, duration, userId } = await request.json()

    if (!title || !description || !doctorId || !scheduledAt) {
      return NextResponse.json({ error: 'Campos obrigatórios: title, description, doctorId, scheduledAt' }, { status: 400 })
    }

    const requesterRole = (session.user as { role?: string })?.role
    const effectiveUserId = typeof userId === 'string' && userId.trim().length > 0 ? userId : session.user.id

    if ((requesterRole === 'ADMIN' || requesterRole === 'DOCTOR') && !effectiveUserId) {
      return NextResponse.json({ error: 'Paciente não informado' }, { status: 400 })
    }

    if (requesterRole !== 'ADMIN' && requesterRole !== 'DOCTOR' && effectiveUserId !== session.user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para agendar para outro paciente' }, { status: 403 })
    }

    const patient = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: { id: true, name: true, role: true }
    })

    if (!patient || patient.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Paciente inválido' }, { status: 400 })
    }

    // Verificar se o médico existe
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        role: 'DOCTOR'
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Médico não encontrado' }, { status: 404 })
    }

    // Verificar se a data não é no passado
    const scheduledDate = new Date(scheduledAt)
    if (scheduledDate < new Date()) {
      return NextResponse.json({ error: 'Não é possível agendar consultas no passado' }, { status: 400 })
    }

    // Verificar conflitos de horário para o médico com verificação precisa
    const consultationDuration = duration || 30
    const conflictingConsultations = await prisma.consultation.findMany({
      where: {
        doctorId: doctorId,
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS']
        },
        scheduledAt: {
          gte: new Date(scheduledDate.getTime() - 60 * 60 * 1000), // 1 hora antes
          lte: new Date(scheduledDate.getTime() + consultationDuration * 60 * 1000 + 60 * 60 * 1000) // duração + 1 hora depois
        }
      },
      select: {
        scheduledAt: true,
        duration: true
      }
    })

    // Verificar se há conflito real considerando a duração exata
    const hasConflict = conflictingConsultations.some((consultation) => {
      const consultationStart = new Date(consultation.scheduledAt).getTime()
      const consultationEnd = consultationStart + (consultation.duration * 60 * 1000)
      const requestedStart = scheduledDate.getTime()
      const requestedEnd = requestedStart + (consultationDuration * 60 * 1000)

      // Verifica se há sobreposição de horários
      return (
        (requestedStart >= consultationStart && requestedStart < consultationEnd) ||
        (requestedEnd > consultationStart && requestedEnd <= consultationEnd) ||
        (requestedStart <= consultationStart && requestedEnd >= consultationEnd)
      )
    })

    if (hasConflict) {
      // Buscar médicos alternativos disponíveis
      const allDoctors = await prisma.user.findMany({
        where: {
          role: 'DOCTOR',
          id: { not: doctorId }
        },
        select: {
          id: true,
          name: true
        }
      })

      const availableAlternatives = []
      for (const altDoctor of allDoctors) {
        const altConflicts = await prisma.consultation.findMany({
          where: {
            doctorId: altDoctor.id,
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            scheduledAt: {
              gte: new Date(scheduledDate.getTime() - 60 * 60 * 1000),
              lte: new Date(scheduledDate.getTime() + consultationDuration * 60 * 1000 + 60 * 60 * 1000)
            }
          },
          select: { scheduledAt: true, duration: true }
        })

        const altHasConflict = altConflicts.some((c) => {
          const cStart = new Date(c.scheduledAt).getTime()
          const cEnd = cStart + (c.duration * 60 * 1000)
          const rStart = scheduledDate.getTime()
          const rEnd = rStart + (consultationDuration * 60 * 1000)
          return (
            (rStart >= cStart && rStart < cEnd) ||
            (rEnd > cStart && rEnd <= cEnd) ||
            (rStart <= cStart && rEnd >= cEnd)
          )
        })

        if (!altHasConflict) {
          availableAlternatives.push(altDoctor)
        }
      }

      if (availableAlternatives.length > 0) {
        return NextResponse.json({ 
          error: `O Dr(a). ${doctor.name} não está disponível neste horário.`,
          availableAlternatives: availableAlternatives,
          message: `Temos ${availableAlternatives.length} médico(s) disponível(is) neste horário. Gostaria de agendar com um deles?`
        }, { status: 409 })
      } else {
        return NextResponse.json({ 
          error: 'Nenhum médico disponível neste horário. Por favor, escolha outro horário.' 
        }, { status: 409 })
      }
    }

    // Verificar se o usuário tem assinatura ativa
    if (requesterRole !== 'ADMIN' && requesterRole !== 'DOCTOR') {
      const subscription = await prisma.subscription.findFirst({
        where: { userId: session.user.id, status: 'ACTIVE' }
      })

      if (!subscription) {
        return NextResponse.json({ error: 'Você precisa de uma assinatura ativa para agendar consultas' }, { status: 400 })
      }
    }

    // Criar consulta com status PENDING_CONFIRMATION
    const consultation = await prisma.consultation.create({
      data: {
        userId: patient.id,
        doctorId,
        title,
        description,
        scheduledAt: scheduledDate,
        duration: consultationDuration,
        status: 'PENDING_CONFIRMATION'
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Criar notificação para admin sobre nova consulta
    try {
      const userName = (session.user as { name?: string })?.name || 'Usuário'
      await prisma.notification.create({
        data: {
          type: 'new_consultation',
          title: 'Nova Consulta Agendada',
          message: `${userName} agendou uma consulta com ${doctor.name}: "${title}"`,
          data: { consultationId: consultation.id, userId: patient.id, doctorId }
        }
      })
    } catch (err) {
      console.error('Erro ao criar notificação de nova consulta:', err)
    }

    // Criar notificação para o médico responsável
    try {
      const userName = (session.user as { name?: string })?.name || 'Usuário'
      await prisma.notification.create({
        data: {
          type: 'new_consultation_doctor',
          title: 'Nova Consulta Pendente',
          message: `${userName} solicitou uma consulta: "${title}" para ${new Date(scheduledDate).toLocaleDateString('pt-BR')} às ${new Date(scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
          data: { consultationId: consultation.id, userId: patient.id, doctorId },
          userId: doctorId
        }
      })
    } catch (err) {
      console.error('Erro ao criar notificação para o médico:', err)
    }

    return NextResponse.json({ message: 'Consulta agendada com sucesso', consultation })
  } catch (error) {
    console.error('Erro ao criar consulta:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
