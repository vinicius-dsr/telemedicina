import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const POST = async (
  _request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> => {
  try {
    const { id } = context.params

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (await getServerSession(authOptions as any)) as Session | null
    const sessionUser = session?.user

    if (!session || sessionUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({ message: 'Notificação marcada como lida' })
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
