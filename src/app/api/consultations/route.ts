import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (await getServerSession(authOptions as any)) as Session | null

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUser = (session as any).user

    const consultations = await prisma.consultation.findMany({
      where: {
        userId: sessionUser.id
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (await getServerSession(authOptions as any)) as Session | null

    if (!session || !session.user) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: (session as any).user.id,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userId: (session as any).user.id,
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
