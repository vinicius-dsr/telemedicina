import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Stethoscope, 
  Users, 
  Shield, 
  Clock, 
  Heart, 
  Smartphone,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Telemedicina</h1>
            </div>
            <div className="flex space-x-2 sm:space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="sm:px-4">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="sm:px-4">Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Consultas Médicas
            <span className="text-blue-600 block">Online</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Acesse cuidados médicos de qualidade de qualquer lugar, a qualquer hora. 
            Nossa plataforma conecta você a profissionais de saúde qualificados.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Começar Agora
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Oferecemos uma experiência completa de telemedicina
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Consultas 24/7</CardTitle>
                <CardDescription>
                  Acesse cuidados médicos a qualquer hora do dia
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Fácil de usar</CardTitle>
                <CardDescription>
                  Interface intuitiva para todas as idades
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Seguro e confidencial</CardTitle>
                <CardDescription>
                  Seus dados médicos são protegidos com criptografia
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Profissionais qualificados</CardTitle>
                <CardDescription>
                  Médicos certificados e especialistas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Prontuário digital</CardTitle>
                <CardDescription>
                  Histórico médico sempre disponível
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Resultados rápidos</CardTitle>
                <CardDescription>
                  Receba diagnósticos e prescrições rapidamente
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Escolha seu plano
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Planos flexíveis para atender suas necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Básico</CardTitle>
                <div className="text-center">
                  <span className="text-4xl font-bold">R$ 29</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription className="text-center">
                  Ideal para consultas ocasionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    2 consultas por mês
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Prontuário digital
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Suporte por chat
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-500 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Mais Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-center">Profissional</CardTitle>
                <div className="text-center">
                  <span className="text-4xl font-bold">R$ 59</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription className="text-center">
                  Para uso profissional regular
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    5 consultas por mês
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Prontuário digital
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Suporte prioritário
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Relatórios médicos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Premium</CardTitle>
                <div className="text-center">
                  <span className="text-4xl font-bold">R$ 99</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription className="text-center">
                  Para uso intensivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Consultas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Prontuário digital
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Suporte 24/7
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Relatórios médicos
          </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Telemedicina avançada
          </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mr-2" />
              <h3 className="text-xl sm:text-2xl font-bold">Telemedicina</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
              Cuidando da sua saúde com tecnologia e humanização
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2024 Telemedicina. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}