import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

<<<<<<< HEAD
export async function GET(request: NextRequest) {
=======
export async function GET() {
>>>>>>> fe0724f4c2988e0aa2d605c3f059fcba2fcabd1a
  try {
  const session = await getServerSession(authOptions) as Session | null

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
