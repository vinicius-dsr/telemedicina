'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Shield, 
  ArrowLeft,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  subscriptions?: Array<{
    id: string
    status: string
    plan: {
      name: string
    }
  }>
}

export default function EditUserPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CLIENT'
  })

  type UserWithRole = { name?: string; role?: string }
  const sessionUser = session?.user as UserWithRole | undefined

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setFormData({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role
          })
        } else {
          toast.error('Usuário não encontrado')
          router.push('/admin/users')
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        toast.error('Erro ao carregar usuário')
      } finally {
        setIsLoading(false)
      }
    }

    if (!session) {
      router.push('/auth/login')
      return
    }
    const userRole = sessionUser?.role

    if (userRole !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchUser()
  }, [session, router, userId, sessionUser?.role])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Usuário atualizado com sucesso!')
        router.push('/admin/users')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao atualizar usuário')
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast.error('Erro ao atualizar usuário')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Usuário excluído com sucesso!')
        router.push('/admin/users')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      toast.error('Erro ao excluir usuário')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive">Admin</Badge>
      case 'CLIENT':
        return <Badge variant="secondary">Cliente</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getSubscriptionStatus = (user: UserData) => {
    if (!user.subscriptions || user.subscriptions.length === 0) {
      return <Badge variant="outline">Sem assinatura</Badge>
    }

    const activeSubscription = user.subscriptions.find(sub => sub.status === 'ACTIVE')
    if (activeSubscription) {
      return <Badge variant="default">{activeSubscription.plan.name}</Badge>
    }

    return <Badge variant="destructive">Expirada</Badge>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    )
  }

  const userRole = (session?.user as unknown as { role?: string })?.role

  if (!session || userRole !== 'ADMIN' || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Editar Usuário</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {user.role === 'ADMIN' ? (
                    <Shield className="h-5 w-5 mr-2 text-red-600" />
                  ) : (
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                  )}
                  Informações do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Tipo:</span>
                  {getRoleBadge(user.role)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Criado em:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Assinatura:</span>
                  {getSubscriptionStatus(user)}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Usuário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Editar Dados</CardTitle>
                <CardDescription>
                  Atualize as informações do usuário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Tipo de Usuário</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleSelectChange('role', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLIENT">Cliente</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
