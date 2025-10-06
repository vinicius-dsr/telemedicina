import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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
