import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
  const sessionUser = (session as Session).user

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'ID do plano é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o plano existe
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já tem uma assinatura ativa
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
  userId: sessionUser.id,
        status: 'ACTIVE'
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Você já possui uma assinatura ativa' },
        { status: 400 }
      )
    }

    // Calcular data de término
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration)

    // Criar assinatura
    const subscription = await prisma.subscription.create({
      data: {
  userId: sessionUser.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: endDate
      },
      include: {
        plan: {
          select: {
            name: true,
            price: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Assinatura criada com sucesso',
      subscription
    })
  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
