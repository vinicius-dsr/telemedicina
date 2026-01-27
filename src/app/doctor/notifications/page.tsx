'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle, Clock, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown> | null
}

export default function DoctorNotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  type UserWithRole = { name?: string; role?: string }
  const user = session?.user as UserWithRole | undefined
  const userRole = user?.role

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications')
      if (!response.ok) {
        throw new Error('Erro ao buscar notificações')
      }
      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      toast.error('Erro ao carregar notificações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar notificação como lida')
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      )
      setUnreadCount((prev) => Math.max(prev - 1, 0))
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar todas como lidas')
      }

      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
      toast.success('Notificações marcadas como lidas')
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast.error('Erro ao marcar todas como lidas')
    }
  }

  const getConsultationId = (notification: NotificationItem) => {
    const value = notification.data?.consultationId
    return typeof value === 'string' ? value : null
  }

  const handleOpenConsultation = async (notification: NotificationItem) => {
    const consultationId = getConsultationId(notification)
    if (!consultationId) return

    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }

    router.push(`/consultations?consultationId=${consultationId}`)
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    if (userRole !== 'DOCTOR') {
      router.push('/dashboard')
      return
    }

    fetchNotifications()
  }, [status, session, userRole, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session || userRole !== 'DOCTOR') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="DOCTOR" userName={user?.name ?? undefined} />

      <div className="lg:pl-64 xl:pl-72">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-6 flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary" />
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Notificações</h1>
              <p className="text-sm text-muted-foreground">Acompanhe novas solicitações de consultas</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Marcar todas
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Caixa de entrada
                {unreadCount > 0 && (
                  <Badge className="bg-primary">{unreadCount} nova(s)</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Notificações recentes vinculadas às consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-base font-medium">Nenhuma notificação</p>
                  <p className="text-sm">Quando houver novas consultas, elas aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => {
                    const consultationId = getConsultationId(notification)
                    const isClickable = Boolean(consultationId)
                    return (
                      <div
                        key={notification.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          notification.isRead ? 'bg-card' : 'bg-primary/10 border-primary/20'
                        } ${isClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
                        onClick={() => {
                          if (isClickable) {
                            handleOpenConsultation(notification)
                          }
                        }}
                        onKeyDown={(event) => {
                          if (!isClickable) return
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleOpenConsultation(notification)
                          }
                        }}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        aria-label={isClickable ? 'Ver consulta' : undefined}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <Badge className="bg-primary">Nova</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.createdAt).toLocaleString('pt-BR')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleMarkAsRead(notification.id)
                                }}
                                className="text-xs"
                              >
                                Marcar como lida
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
