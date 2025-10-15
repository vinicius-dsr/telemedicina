'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  UserPlus,
  Users,
  Video,
  Heart,
  Calendar,
  FileText,
  Lock,
  CheckCircle,
  Menu,
  ChevronDown
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  // Por enquanto, vamos assumir que o usuário não está autenticado
  // Isso pode ser implementado depois quando NextAuth estiver configurado
  const isAuthenticated = false

  // Lógica para os botões baseada no status de autenticação
  const getAppointmentButtonHref = () => {
    return '/auth/login' // Sempre vai para login conforme solicitado
  }

  const getRegisterButtonHref = () => {
    return '/auth/register' // Sempre vai para cadastro
  }

  const getAppointmentButtonText = () => {
    return isAuthenticated ? 'Agendar Consulta' : 'Agende sua Consulta'
  }

  const getRegisterButtonText = () => {
    return isAuthenticated ? 'Minhas Consultas' : 'Cadastre-se'
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="px-4 lg:px-40 flex justify-center py-3 sticky top-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between w-full max-w-[960px]">
            <Link href="/" className="flex items-center gap-4 text-primary hover:opacity-80 transition-opacity">
              <div className="size-8">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Telemedicina SaaS</h2>
            </Link>
            <div className="hidden md:flex flex-1 justify-end gap-8">
              <nav className="flex items-center gap-9">
                <a className="text-sm font-medium leading-normal hover:text-primary" href="#funciona">Como Funciona</a>
                <a className="text-sm font-medium leading-normal hover:text-primary" href="#planos">Planos</a>
                <a className="text-sm font-medium leading-normal hover:text-primary" href="#faq">FAQ</a>
              </nav>
              <div className="flex gap-2">
                <Link href={getAppointmentButtonHref()}>
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <span className="truncate">{getAppointmentButtonText()}</span>
                  </Button>
                </Link>
                <Link href={getRegisterButtonHref()}>
                  <Button variant="outline" className="bg-muted text-muted-foreground hover:bg-muted/80">
                    <span className="truncate">{getRegisterButtonText()}</span>
                  </Button>
                </Link>
                <ThemeToggle />
              </div>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    <a 
                      className="text-base font-medium leading-normal hover:text-primary py-2 transition-colors" 
                      href="#funciona" 
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Como Funciona
                    </a>
                    <a 
                      className="text-base font-medium leading-normal hover:text-primary py-2 transition-colors" 
                      href="#planos" 
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Planos
                    </a>
                    <a 
                      className="text-base font-medium leading-normal hover:text-primary py-2 transition-colors" 
                      href="#faq" 
                      onClick={() => setIsSheetOpen(false)}
                    >
                      FAQ
                    </a>
                    <div className="flex flex-col gap-3 pt-4 border-t">
                      <Link href="/auth/login" onClick={() => setIsSheetOpen(false)}>
                        <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                          <span className="truncate">Agende sua Consulta</span>
                        </Button>
                      </Link>
                      <Link href={getRegisterButtonHref()} onClick={() => setIsSheetOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <span className="truncate">{getRegisterButtonText()}</span>
                        </Button>
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <div className="px-4 lg:px-40 flex flex-1 justify-center py-10 lg:py-20">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="@container">
                <div className="flex flex-col gap-10 @[864px]:flex-row @[864px]:gap-12 items-center">
                  <div className="flex flex-col gap-6 text-left @[864px]:w-1/2">
                    <div className="flex flex-col gap-4">
                      <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-6xl">
                        Sua saúde a um clique de distância.
                      </h1>
                      <h2 className="text-base font-normal leading-normal @[480px]:text-lg">
                        Consultas médicas online, quando e onde você precisar.
                      </h2>
                    </div>
                    <Link href="/auth/login">
                      <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-fit">
                        <span className="truncate">Agende sua Consulta</span>
                      </Button>
                    </Link>
                  </div>
                  <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl @[864px]:w-1/2" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCwpcxLfogc3dyrIxNdYEa0P_1Yo3f88EXiW01d7NB2d0wuik_Pvmcfy60dV-IYMBuzS6CZ-EE46wFW2_wEFRHQpGrd6_SYKT7ClC9F6PVCu7uAUPawhVpbQGeCtpRjalEeVpGbygZ8xIq6IX1_uZTfWGVGBPVXGfHPzcdbFimGz9x_klPms7W_ZpD_7r34XFipwnFPpM9OUb7Pl-iOzD7t9w5B8ALk7MGkM4oqDZfMk_u8Hss10GEPPzXMWJ-LckGISAD017Gg_Cpy")'}}>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How it Works Section */}
          <div id="funciona" className="px-4 lg:px-40 flex flex-1 justify-center py-10 lg:py-20 bg-white dark:bg-muted/50">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-col gap-10 @container">
                <div className="flex flex-col gap-6 items-center text-center">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold leading-tight @[480px]:text-4xl @[480px]:font-black tracking-[-0.033em] max-w-[720px]">
                      Atendimento simples e rápido em 3 passos
                    </h1>
                    <p className="text-base font-normal leading-normal max-w-[720px]">
                      Nossa plataforma foi desenhada para ser intuitiva e fácil de usar. Em apenas alguns passos, você tem acesso a um profissional de saúde qualificado.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 p-0">
                  <Card className="border-border bg-background dark:bg-muted p-6 text-center items-center">
                    <UserPlus className="text-primary mb-4" style={{fontSize: '40px'}} />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold leading-tight">1. Cadastro</h2>
                      <p className="text-sm font-normal leading-normal text-muted-foreground">Crie sua conta em poucos minutos e tenha acesso a todas as funcionalidades.</p>
                    </div>
                  </Card>
                  <Card className="border-border bg-background dark:bg-muted p-6 text-center items-center">
                    <Users className="text-primary mb-4" style={{fontSize: '40px'}} />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold leading-tight">2. Escolha o profissional</h2>
                      <p className="text-sm font-normal leading-normal text-muted-foreground">Navegue pela nossa lista de especialistas e escolha o que melhor se adapta a você.</p>
                    </div>
                  </Card>
                  <Card className="border-border bg-background dark:bg-muted p-6 text-center items-center">
                    <Video className="text-primary mb-4" style={{fontSize: '40px'}} />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold leading-tight">3. Consulta Online</h2>
                      <p className="text-sm font-normal leading-normal text-muted-foreground">Faça sua consulta por vídeo com total segurança e conveniência.</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Section */}
          <div id="planos" className="px-4 lg:px-40 flex flex-1 justify-center py-10 lg:py-20">
            <div className="layout-content-container flex flex-col items-center gap-10 max-w-[960px] flex-1">
              <div className="flex flex-col gap-4 text-center">
                <h1 className="text-3xl font-bold leading-tight @[480px]:text-4xl @[480px]:font-black tracking-[-0.033em] max-w-[720px]">
                  Planos de Assinatura
                </h1>
                <p className="text-base font-normal leading-normal max-w-[720px]">
                  Escolha o plano que melhor se adapta às suas necessidades.
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 w-full">
                <Card className="flex flex-1 flex-col gap-6 border-border bg-card p-8">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold leading-tight">Básico</h2>
                    <p className="flex items-baseline gap-1">
                      <span className="text-5xl font-black leading-tight tracking-[-0.033em]">R$29</span>
                      <span className="text-base font-medium">/mês</span>
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <span className="truncate">Assinar Agora</span>
                  </Button>
                  <div className="flex flex-col gap-3">
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> 2 consultas mensais</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Acesso a clínicos gerais</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Prescrições digitais</div>
                  </div>
                </Card>
                <Card className="flex flex-1 flex-col gap-6 border-2 border-secondary bg-card p-8 relative">
                  <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-xs font-medium">Mais Popular</Badge>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold leading-tight">Premium</h2>
                    <p className="flex items-baseline gap-1">
                      <span className="text-5xl font-black leading-tight tracking-[-0.033em]">R$59</span>
                      <span className="text-base font-medium">/mês</span>
                    </p>
                  </div>
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <span className="truncate">Assinar Agora</span>
                  </Button>
                  <div className="flex flex-col gap-3">
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> 5 consultas mensais</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Acesso a especialistas</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Prescrições digitais</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Suporte 24/7</div>
                  </div>
                </Card>
                <Card className="flex flex-1 flex-col gap-6 border-border bg-card p-8">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold leading-tight">Família</h2>
                    <p className="flex items-baseline gap-1">
                      <span className="text-5xl font-black leading-tight tracking-[-0.033em]">R$99</span>
                      <span className="text-base font-medium">/mês</span>
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <span className="truncate">Assinar Agora</span>
                  </Button>
                  <div className="flex flex-col gap-3">
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Consultas ilimitadas</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Acesso a todos os especialistas</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Prescrições digitais</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Suporte 24/7</div>
                    <div className="text-sm flex gap-3 items-center"><CheckCircle className="text-secondary h-4 w-4" /> Contas para dependentes</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="px-4 lg:px-40 flex flex-1 justify-center py-10 lg:py-20 bg-white dark:bg-muted/50">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-col gap-10 @container">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold leading-tight @[480px]:text-4xl @[480px]:font-black tracking-[-0.033em] max-w-[720px]">
                      Benefícios e Recursos
                    </h1>
                    <p className="text-base font-normal leading-normal max-w-[720px]">
                      Oferecemos uma solução completa para sua saúde, com diversos benefícios para facilitar sua vida.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 p-0">
                  <Card className="flex flex-1 gap-4 rounded-xl p-4 flex-col bg-muted dark:bg-muted">
                    <Heart className="text-primary" style={{fontSize: '32px'}} />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold leading-tight">Acesso a especialistas</h2>
                      <p className="text-sm font-normal leading-normal text-muted-foreground">Tenha acesso a uma vasta rede de especialistas sem sair de casa.</p>
                    </div>
                  </Card>
                  <Card className="flex flex-1 gap-4 rounded-xl p-4 flex-col bg-muted dark:bg-muted">
                    <Calendar className="text-primary" style={{fontSize: '32px'}} />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold leading-tight">Sem filas</h2>
                      <p className="text-sm font-normal leading-normal text-muted-foreground">Evite longas esperas e agende sua consulta para quando for mais conveniente.</p>
                    </div>
                  </Card>
                  <Card className="flex flex-1 gap-4 rounded-xl p-4 flex-col bg-muted dark:bg-muted">
                    <FileText className="text-primary" style={{fontSize: '32px'}} />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold leading-tight">Prescrições digitais</h2>
                      <p className="text-sm font-normal leading-normal text-muted-foreground">Receba suas prescrições de forma digital e segura.</p>
                    </div>
                  </Card>
                  <Card className="flex flex-1 gap-4 rounded-xl p-4 flex-col bg-muted dark:bg-muted">
                    <Lock className="text-primary" style={{fontSize: '32px'}} />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold leading-tight">Segurança de dados</h2>
                      <p className="text-sm font-normal leading-normal text-muted-foreground">Garantimos a confidencialidade e segurança dos seus dados.</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="px-4 lg:px-40 flex flex-1 justify-center py-10 lg:py-20">
            <div className="layout-content-container flex flex-col items-center gap-10 max-w-[960px] flex-1">
              <div className="flex flex-col gap-4 text-center">
                <h1 className="text-3xl font-bold leading-tight @[480px]:text-4xl @[480px]:font-black tracking-[-0.033em]">
                  O que nossos clientes dizem
                </h1>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 w-full">
                <Card className="flex flex-col gap-4 p-6 bg-card border-border">
                  <div className="flex items-center gap-4">
                    <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSpakPou31_mseO-Q1YidqM6bl7SHRXVX6hbaFyB0Ka90ZB_BM_m9C0b8bGi6t9gHAV93UiyHxJAq2IHwLkQYVsUlApBWS2rcdBYxQLEYRwDh6l2XAvR5vXTjL2QVXvmZwNVgfVXxnU8Z2FhYMrVqPGFbiWH9OppfJsrJlGkCyWO5cliiDUVNx_qH81ALRdOvAS8V6xs4SAv8VPl3nmY3vU0nZj8gIF3fELL6xOcFwy4LiQ7qBpIYyqmR7VuQda5bRJNOxessnLwaj"/>
                    <div>
                      <h3 className="font-bold">Ana Silva</h3>
                      <p className="text-sm text-muted-foreground">Paciente</p>
                    </div>
                  </div>
                  <p className="text-sm">"A praticidade de ter uma consulta no conforto de casa não tem preço. Serviço excelente e médicos muito atenciosos."</p>
                </Card>
                <Card className="flex flex-col gap-4 p-6 bg-card border-border">
                  <div className="flex items-center gap-4">
                    <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcZY2gzg7-9aB2qZOahFhH-Exq9PPS4JDZodotvVEBzzHOEobOSJveq5gDpzj9iBYikRrd4OYPm6nA7JKET4WmIRL_-uSsSzQk0wiZjTy7v8G0RD776stFr4FSJOHOcNM9njzyeGP8Ux8I2pjTOWkaWeBThabXMc8ubeYTyqsVWlXg9PQmN8zVVyh4wOsL_3g51j20JjHI-JStnUE9i_vsbJwNrfOv2qtT4YGJ9ZOO_kQL8nNlpogS_uHtcRvbnndVljZLF2e2oqC7"/>
                    <div>
                      <h3 className="font-bold">Carlos Pereira</h3>
                      <p className="text-sm text-muted-foreground">Paciente</p>
                    </div>
                  </div>
                  <p className="text-sm">"Plataforma fácil de usar e o plano família é perfeito para nós. Recomendo a todos que buscam conveniência e qualidade."</p>
                </Card>
                <Card className="flex flex-col gap-4 p-6 bg-card border-border">
                  <div className="flex items-center gap-4">
                    <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpEt5l9Esn6Obf4-MklKpn_LSeHFLzlogPLhgAsPBHOuMOm2efz7eoHc3fK_wUk_u31YznLR4Wv5UsyACYjwZp_yU4IJEyxB6zzMJqoukxN9NNnupSgskpo2ifjKWlkRxgcYsSIuUfJ2IP4xsC2X2BICempGLjXwDV0aIJeyQVLcK_p7CskpGJQsxJUgtdm_xtgS_LYuTsfENAMZgLi3OHNcnOFjlx1DZZGrhk3tNhGNxkdWDcicdZ4mCsjRa2dCnr5or_3Run4b9X"/>
                    <div>
                      <h3 className="font-bold">Juliana Costa</h3>
                      <p className="text-sm text-muted-foreground">Paciente</p>
                    </div>
                  </div>
                  <p className="text-sm">"Consegui resolver um problema de saúde rapidamente sem precisar sair de casa. O sistema de prescrição digital é muito eficiente."</p>
                </Card>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="px-4 lg:px-40 flex flex-1 justify-center py-10 lg:py-20 bg-white dark:bg-muted/50">
            <div className="layout-content-container flex flex-col items-center gap-10 max-w-[960px] flex-1">
              <div className="flex flex-col gap-4 text-center">
                <h1 className="text-3xl font-bold leading-tight @[480px]:text-4xl @[480px]:font-black tracking-[-0.033em]">
                  Perguntas Frequentes
                </h1>
              </div>
              <div className="w-full max-w-[720px] space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="rounded-lg bg-muted dark:bg-muted p-4 mb-4">
                    <AccordionTrigger className="font-bold hover:no-underline">
                      As prescrições têm validade legal?
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 text-sm text-muted-foreground">
                      Sim, todas as prescrições emitidas em nossa plataforma são assinadas digitalmente pelos médicos e têm a mesma validade de uma receita em papel, sendo aceitas em todo o território nacional.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="rounded-lg bg-muted dark:bg-muted p-4 mb-4">
                    <AccordionTrigger className="font-bold hover:no-underline">
                      Meus dados estão seguros na plataforma?
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 text-sm text-muted-foreground">
                      Absolutamente. Utilizamos criptografia de ponta a ponta e seguimos rigorosos protocolos de segurança de dados para garantir a total confidencialidade e proteção de suas informações de saúde.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="rounded-lg bg-muted dark:bg-muted p-4">
                    <AccordionTrigger className="font-bold hover:no-underline">
                      Como posso cancelar minha assinatura?
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 text-sm text-muted-foreground">
                      Você pode cancelar sua assinatura a qualquer momento, sem taxas ou burocracia. Basta acessar as configurações da sua conta e seguir as instruções para o cancelamento.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-40 flex justify-center py-10 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-[960px] gap-6">
            <div className="flex items-center gap-4 text-primary">
              <div className="size-6">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold">Telemedicina SaaS</h2>
            </div>
            <div className="text-sm text-center md:text-right text-muted-foreground">
              <p> 2024 Telemedicina SaaS. Todos os direitos reservados.</p>
              <a className="hover:text-primary" href="#">Termos de Serviço</a> • <a className="hover:text-primary" href="#">Política de Privacidade</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}