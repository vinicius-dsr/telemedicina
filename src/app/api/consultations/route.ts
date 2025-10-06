import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    return NextResponse.json({
      consultations
    })
  } catch (error) {
    console.error('Erro ao buscar consultas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { title, description, scheduledAt, duration } = await request.json()

    if (!title || !description || !scheduledAt || !duration) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem assinatura ativa
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Você precisa de uma assinatura ativa para agendar consultas' },
        { status: 400 }
      )
    }

    // Criar consulta
    const consultation = await prisma.consultation.create({
      data: {
        userId: session.user.id,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration),
        status: 'SCHEDULED'
      }
    })

    return NextResponse.json({
      message: 'Consulta agendada com sucesso',
      consultation
    })
  } catch (error) {
    console.error('Erro ao criar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
