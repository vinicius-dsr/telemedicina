import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Cliente cancela a consulta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = session.user.role

    if (userRole !== 'CLIENT') {
      return NextResponse.json({ error: 'Apenas clientes podem cancelar consultas' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''

    if (!reason) {
      return NextResponse.json({ error: 'Motivo do cancelamento é obrigatório' }, { status: 400 })
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true } }
      }
    })

    if (!consultation) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 })
    }

    if (consultation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para cancelar esta consulta' }, { status: 403 })
    }

    if (['CANCELLED', 'REJECTED', 'COMPLETED'].includes(consultation.status)) {
      return NextResponse.json({ error: 'Esta consulta não pode ser cancelada' }, { status: 400 })
    }

    const now = new Date()
    const scheduledAt = new Date(consultation.scheduledAt)
    const minAdvanceMs = 3 * 60 * 60 * 1000
    if (scheduledAt.getTime() - now.getTime() < minAdvanceMs) {
      return NextResponse.json(
        { error: 'Cancelamentos só são permitidos com pelo menos 3 horas de antecedência' },
        { status: 400 }
      )
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: `Cancelada pelo paciente. Motivo: ${reason}`
      }
    })

    if (consultation.doctorId) {
      try {
        await prisma.notification.create({
          data: {
            type: 'consultation_cancelled',
            title: 'Consulta Cancelada',
            message: `${consultation.user?.name || 'Paciente'} cancelou a consulta "${consultation.title}". Motivo: ${reason}`,
            data: {
              consultationId: consultation.id,
              userId: consultation.userId,
              doctorId: consultation.doctorId,
              reason
            },
            userId: consultation.doctorId
          }
        })
      } catch (err) {
        console.error('Erro ao criar notificação para o médico:', err)
      }
    }

    return NextResponse.json({ message: 'Consulta cancelada', consultation: updatedConsultation })
  } catch (error) {
    console.error('Erro ao cancelar consulta:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
