import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as Session | null

    const sessionUser = (session as unknown as { user?: { role?: string } })?.user

  if (!session || sessionUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Marcar todas notificações como lidas no banco
    await (prisma as any).notification.updateMany({ where: { isRead: false }, data: { isRead: true } })

  return NextResponse.json({ message: 'Todas as notificações foram marcadas como lidas' })
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
