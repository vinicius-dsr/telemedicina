import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Médico marca a consulta como concluída
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = session.user.role

    if (userRole !== 'DOCTOR') {
      return NextResponse.json({ error: 'Apenas médicos podem concluir consultas' }, { status: 403 })
    }

    const { id } = await params

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

    if (consultation.doctorId !== session.user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para concluir esta consulta' }, { status: 403 })
    }

    if (['CANCELLED', 'REJECTED', 'COMPLETED'].includes(consultation.status)) {
      return NextResponse.json({ error: 'Esta consulta não pode ser concluída' }, { status: 400 })
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id },
      data: { status: 'COMPLETED' }
    })

    try {
      await prisma.notification.create({
        data: {
          type: 'consultation_completed',
          title: 'Consulta Concluída',
          message: `Sua consulta "${consultation.title}" foi marcada como concluída pelo Dr(a). ${consultation.doctor?.name}.`,
          data: {
            consultationId: consultation.id,
            doctorId: consultation.doctorId
          },
          userId: consultation.userId
        }
      })
    } catch (err) {
      console.error('Erro ao criar notificação:', err)
    }

    return NextResponse.json({ message: 'Consulta concluída', consultation: updatedConsultation })
  } catch (error) {
    console.error('Erro ao concluir consulta:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
