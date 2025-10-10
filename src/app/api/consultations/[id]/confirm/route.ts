import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Médico confirma a consulta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userRole = session.user.role
    
    if (userRole !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Apenas médicos podem confirmar consultas' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Buscar a consulta
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o médico é o responsável pela consulta
    if (consultation.doctorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para confirmar esta consulta' },
        { status: 403 }
      )
    }

    // Verificar se a consulta está pendente
    if (consultation.status !== 'PENDING_CONFIRMATION') {
      return NextResponse.json(
        { error: `Esta consulta já foi ${consultation.status === 'CONFIRMED' ? 'confirmada' : 'processada'}` },
        { status: 400 }
      )
    }

    // Confirmar a consulta
    const updatedConsultation = await prisma.consultation.update({
      where: { id },
      data: {
        status: 'CONFIRMED'
      }
    })

    // Criar notificação para o paciente
    try {
      await prisma.notification.create({
        data: {
          type: 'consultation_confirmed',
          title: 'Consulta Confirmada! ✅',
          message: `O Dr(a). ${consultation.doctor?.name} confirmou sua consulta "${consultation.title}" agendada para ${new Date(consultation.scheduledAt).toLocaleDateString('pt-BR')} às ${new Date(consultation.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
          data: {
            consultationId: consultation.id,
            doctorId: consultation.doctorId,
            scheduledAt: consultation.scheduledAt
          },
          userId: consultation.userId
        }
      })
    } catch (err) {
      console.error('Erro ao criar notificação:', err)
    }

    return NextResponse.json({
      message: 'Consulta confirmada com sucesso',
      consultation: updatedConsultation
    })

  } catch (error) {
    console.error('Erro ao confirmar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
