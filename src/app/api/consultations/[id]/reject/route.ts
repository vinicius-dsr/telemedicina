import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Médico rejeita a consulta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userRole = (session.user as { role?: string })?.role
    
    if (userRole !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Apenas médicos podem rejeitar consultas' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { reason } = body

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
        { error: 'Você não tem permissão para rejeitar esta consulta' },
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

    // Rejeitar a consulta
    const updatedConsultation = await prisma.consultation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: reason ? `Motivo da rejeição: ${reason}` : 'Consulta rejeitada pelo médico'
      }
    })

    // Criar notificação para o paciente
    try {
      await prisma.notification.create({
        data: {
          type: 'consultation_rejected',
          title: 'Consulta Não Confirmada',
          message: `O Dr(a). ${consultation.doctor?.name} não pôde confirmar sua consulta "${consultation.title}". ${reason ? `Motivo: ${reason}` : 'Por favor, escolha outro horário ou médico.'}`,
          data: {
            consultationId: consultation.id,
            doctorId: consultation.doctorId,
            reason: reason || null
          },
          userId: consultation.userId
        }
      })
    } catch (err) {
      console.error('Erro ao criar notificação:', err)
    }

    return NextResponse.json({
      message: 'Consulta rejeitada',
      consultation: updatedConsultation
    })

  } catch (error) {
    console.error('Erro ao rejeitar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
