import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar estatísticas
    const [
      totalUsers,
      activeSubscriptions,
      totalConsultations,
      monthlyRevenue,
      recentUsers,
      recentConsultations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.consultation.count(),
      prisma.subscription.aggregate({
        where: { 
          status: 'ACTIVE',
          startDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: {
          plan: {
            select: {
              price: true
            }
          }
        }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.consultation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // Calcular receita mensal
    const subscriptions = await prisma.subscription.findMany({
      where: { 
        status: 'ACTIVE',
        startDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      include: {
        plan: {
          select: {
            price: true
          }
        }
      }
    })

    const monthlyRevenue = subscriptions.reduce((sum, sub) => sum + sub.plan.price, 0)

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalConsultations,
      monthlyRevenue,
      recentUsers,
      recentConsultations
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
