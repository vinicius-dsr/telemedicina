'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Stethoscope,
  Home,
  Calendar,
  FileText,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  DollarSign,
  BarChart3,
  User,
  CreditCard,
  Shield,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole?: string
  userName?: string
}

export function Sidebar({ userRole = 'PATIENT', userName }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [doctorUnreadCount, setDoctorUnreadCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  const patientMenuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Consultas', href: '/consultations' },
    { icon: FileText, label: 'Prontuário', href: '/medical-records' },
    { icon: Clock, label: 'Histórico', href: '/history' },
    { icon: CreditCard, label: 'Planos', href: '/plans' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ]

  const doctorMenuItems = [
    { icon: Home, label: 'Dashboard', href: '/doctor' },
    { icon: Calendar, label: 'Consultas', href: '/consultations' },
    { icon: Bell, label: 'Notificações', href: '/doctor/notifications', badgeCount: doctorUnreadCount },
    { icon: FileText, label: 'Prontuários', href: '/medical-records' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ]

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Usuários', href: '/admin/users' },
    { icon: Calendar, label: 'Consultas', href: '/admin/consultations' },
    { icon: DollarSign, label: 'Planos', href: '/admin/plans' },
    { icon: BarChart3, label: 'Relatórios', href: '/admin/reports' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ]

  const menuItems = 
    userRole === 'ADMIN' ? adminMenuItems :
    userRole === 'DOCTOR' ? doctorMenuItems :
    patientMenuItems

  useEffect(() => {
    if (userRole !== 'DOCTOR') return
    if (!session?.user?.id) return

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        if (!response.ok) return
        const data = await response.json()
        setDoctorUnreadCount(data.unreadCount || 0)
      } catch (error) {
        console.error('Erro ao buscar notificações:', error)
      }
    }

    fetchNotifications()
  }, [pathname, session?.user?.id, userRole])

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-sidebar-border">
        <Stethoscope className="h-8 w-8 text-sidebar-primary" />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-sidebar-foreground">Telemedicina</h1>
          {userRole && (
            <span className="text-xs text-sidebar-foreground/60">
              {userRole === 'ADMIN' ? 'Admin' : userRole === 'DOCTOR' ? 'Médico' : 'Paciente'}
            </span>
          )}
        </div>
      </div>

      {/* User Info */}
      {userName && (
        <div className="px-6 py-4 border-b border-sidebar-border bg-sidebar-accent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sidebar-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-sidebar-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60">
                {userRole === 'ADMIN' ? 'Administrador' : 
                 userRole === 'DOCTOR' ? 'Médico(a)' : 'Paciente'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const exactMatchOnly = new Set(['/admin', '/dashboard', '/doctor'])
            const isActive = pathname === item.href || (!exactMatchOnly.has(item.href) && pathname?.startsWith(item.href + '/'))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  {'badgeCount' in item && item.badgeCount > 0 && (
                    <span
                      className={cn(
                        'ml-auto min-w-[22px] rounded-full px-2 py-0.5 text-center text-xs font-semibold',
                        isActive
                          ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                          : 'bg-sidebar-primary text-sidebar-primary-foreground'
                      )}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Theme Toggle & Logout */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-sidebar-foreground/60">Tema</span>
          <ThemeToggle />
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-sidebar-primary" />
          <h1 className="text-lg font-bold text-sidebar-foreground">Telemedicina</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobile}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-sidebar z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-sidebar-border',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:bottom-0 lg:w-64 xl:w-72 bg-sidebar border-r border-sidebar-border z-30">
        <SidebarContent />
      </aside>

      {/* Spacer for mobile top bar */}
      <div className="lg:hidden h-[57px]" />
    </>
  )
}
