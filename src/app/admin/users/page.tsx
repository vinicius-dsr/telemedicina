'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sidebar } from '@/components/Sidebar'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  User,
  Mail,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface User {
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

export default function UsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT'
  })

  type UserWithRole = { name?: string; role?: string }
  const user = session?.user as UserWithRole | undefined

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    const userRole = user?.role

    if (userRole !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchUsers()
  }, [session, router, user?.role])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Usuário criado com sucesso!')
        setIsCreateDialogOpen(false)
        setFormData({ name: '', email: '', password: '', role: 'CLIENT' })
        fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao criar usuário')
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast.error('Erro ao criar usuário')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Usuário excluído com sucesso!')
        fetchUsers()
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const getSubscriptionStatus = (user: User) => {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  const userRole = (session?.user as unknown as { role?: string })?.role

  if (!session || userRole !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="ADMIN" userName={session?.user?.name ?? undefined} />
      
      <div className="lg:pl-64 xl:pl-72 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-6 flex items-center gap-2 sm:gap-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
          </div>
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Criar Novo Usuário</DialogTitle>
                <DialogDescription className="text-sm">
                  Preencha os dados para criar um novo usuário no sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-3 sm:space-y-4">
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
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Senha temporária"
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
                      <SelectItem value="DOCTOR">Médico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreating} className="w-full sm:w-auto order-1 sm:order-2">
                    {isCreating ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-background dark:bg-muted border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* User Info Section */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {user.role === 'ADMIN' ? (
                        <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
                      ) : (
                        <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-medium text-foreground truncate">
                          {user.name}
                        </h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center break-all">
                          <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="mt-2">
                        {getSubscriptionStatus(user)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Section */}
                  <div className="flex sm:flex-col gap-2 justify-end sm:justify-start">
                    <Link href={`/admin/users/${user.id}/edit`} className="flex-1 sm:flex-initial">
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit className="h-4 w-4 sm:mr-0" />
                        <span className="ml-2 sm:hidden">Editar</span>
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-destructive hover:text-destructive/80 border-destructive/20 hover:bg-destructive/10 flex-1 sm:flex-initial w-full"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-0" />
                      <span className="ml-2 sm:hidden">Excluir</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 px-4">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando o primeiro usuário'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Usuário
              </Button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
