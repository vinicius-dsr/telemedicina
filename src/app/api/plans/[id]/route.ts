import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const plan = await prisma.plan.findUnique({
      where: {
        id,
        isActive: true
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      plan
    })
  } catch (error) {
    console.error('Erro ao buscar plano:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
