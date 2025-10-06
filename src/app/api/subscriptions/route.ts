import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions) as Session | null

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

<<<<<<< HEAD
    const { planId, paymentMethod } = await request.json()
=======
    const sessionUser = (session as Session).user

    const { planId } = await request.json()
>>>>>>> fe0724f4c2988e0aa2d605c3f059fcba2fcabd1a

    if (!planId) {
      return NextResponse.json({ error: 'ID do plano é obrigatório' }, { status: 400 })
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: sessionUser.id, status: 'ACTIVE' }
    })

    if (existingSubscription) {
      return NextResponse.json({ error: 'Você já possui uma assinatura ativa' }, { status: 400 })
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration)

    const subscription = await prisma.subscription.create({
      data: {
        userId: sessionUser.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate
      },
      include: { plan: { select: { name: true, price: true } } }
    })

    return NextResponse.json({ message: 'Assinatura criada com sucesso', subscription })
  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
