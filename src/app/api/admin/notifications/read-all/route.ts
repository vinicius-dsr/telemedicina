import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

  const sessionUser = (session as Session | null)?.user

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
