import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Simple history: last 20 consultations and medical records titles
    const [consultations, records] = await Promise.all([
      prisma.consultation.findMany({
        where: { userId: (session.user as any).id },
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.medicalRecord.findMany({
        where: { userId: (session.user as any).id },
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    ])

    const history = [
      ...consultations.map(c => ({ id: c.id, title: c.title, type: 'Consulta', createdAt: c.createdAt })),
      ...records.map(r => ({ id: r.id, title: r.title, type: 'Prontuário', createdAt: r.createdAt })),
    ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
