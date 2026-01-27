import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ContextParam =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> }

export async function POST(
  _request: NextRequest,
  context: ContextParam
): Promise<NextResponse> {
  try {
    const params = await Promise.resolve(context.params)
    const id = (await params).id

    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true }
    })

    return NextResponse.json({ message: 'Notificação marcada como lida' })
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
