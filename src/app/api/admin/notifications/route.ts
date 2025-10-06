import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

  const sessionUser = (session as Session | null)?.user

  if (!session || sessionUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar notificações dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Buscar consultas recentes
    const recentConsultations = await prisma.consultation.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Buscar novos usuários
    const newUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        role: 'CLIENT'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Buscar assinaturas expiradas
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'EXPIRED',
        endDate: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        plan: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        endDate: 'desc'
      }
    })

    // Gerar notificações
    type Notification = {
      id: string
      type: string
      title: string
      message: string
      createdAt: Date
      isRead: boolean
      data: Record<string, any>
    }

    const notifications: Notification[] = []

    // Notificações de novas consultas
    recentConsultations.forEach(consultation => {
      notifications.push({
        id: `consultation_${consultation.id}`,
        type: 'new_consultation',
        title: 'Nova Consulta Agendada',
        message: `${consultation.user.name} agendou uma consulta: "${consultation.title}"`,
        createdAt: consultation.createdAt,
        isRead: false,
        data: {
          consultationId: consultation.id,
          userId: consultation.userId
        }
      })
    })

    // Notificações de novos usuários
    newUsers.forEach(user => {
      notifications.push({
        id: `user_${user.id}`,
        type: 'new_user',
        title: 'Novo Usuário Cadastrado',
        message: `${user.name} se cadastrou no sistema`,
        createdAt: user.createdAt,
        isRead: false,
        data: {
          userId: user.id
        }
      })
    })

    // Notificações de assinaturas expiradas
    expiredSubscriptions.forEach(subscription => {
      notifications.push({
        id: `subscription_${subscription.id}`,
        type: 'subscription_expired',
        title: 'Assinatura Expirada',
        message: `A assinatura ${subscription.plan.name} de ${subscription.user.name} expirou`,
        createdAt: subscription.endDate,
        isRead: false,
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId
        }
      })
    })

    // Ordenar por data de criação (mais recentes primeiro)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Limitar a 50 notificações mais recentes
    const limitedNotifications = notifications.slice(0, 50)

    // Contar não lidas (simulado - em produção você salvaria no banco)
    const unreadCount = limitedNotifications.filter(n => !n.isRead).length

    return NextResponse.json({
      notifications: limitedNotifications,
      unreadCount
    })
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
