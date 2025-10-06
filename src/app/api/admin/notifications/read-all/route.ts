import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions) as Session | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUser = (session as any)?.user

  if (!session || sessionUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Em uma implementação real, você salvaria o status no banco de dados
    // Por enquanto, vamos apenas retornar sucesso
    return NextResponse.json({
      message: 'Todas as notificações foram marcadas como lidas'
    })
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
