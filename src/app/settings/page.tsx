"use client"

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/Sidebar'
import { LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return null
  }

  if (!session) return null

  const userWithRole = session?.user as { name?: string; role?: string } | undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={userWithRole?.role} userName={userWithRole?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Configurações</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Gerencie suas informações básicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Em breve: edição de nome, email, senha e preferências.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessão</CardTitle>
            <CardDescription>Gerencie sua sessão e segurança</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
