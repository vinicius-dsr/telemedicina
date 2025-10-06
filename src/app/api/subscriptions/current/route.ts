import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
  const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

  const sessionUser = session.user

    const subscription = await prisma.subscription.findFirst({
      where: {
  userId: sessionUser.id,
        status: 'ACTIVE'
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
      subscription
    })
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
