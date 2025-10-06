import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  _request: NextRequest,
  { params: _params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (await getServerSession(authOptions as any)) as Session | null

    const sessionUser = session?.user

    if (!session || sessionUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Em uma implementação real, você salvaria o status no banco de dados
    // Por enquanto, vamos apenas retornar sucesso
    return NextResponse.json({
      message: 'Notificação marcada como lida'
    })
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
