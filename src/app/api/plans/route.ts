import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

<<<<<<< HEAD
export async function GET(request: NextRequest) {
=======
export async function GET() {
>>>>>>> fe0724f4c2988e0aa2d605c3f059fcba2fcabd1a
  try {
    const plans = await prisma.plan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    })

    return NextResponse.json({
      plans
    })
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
