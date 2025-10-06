'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: string[]
  isActive: boolean
}

export default function PlansPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = (planId: string) => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    
    // Aqui você implementaria a lógica de pagamento
    // Por enquanto, vamos apenas simular a assinatura
    router.push(`/subscriptions/new?planId=${planId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
            </div>
            <div className="flex space-x-4">
              {session ? (
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha seu plano
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Planos flexíveis para atender suas necessidades de telemedicina. 
            Todos os planos incluem acesso 24/7 e suporte especializado.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
                  {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.name === 'Profissional' 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.name === 'Profissional' && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  <Star className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-gray-600">/mês</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.name === 'Profissional' ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {session ? 'Assinar Agora' : 'Fazer Login para Assinar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Comparação de Recursos
          </h3>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recurso
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Consultas por mês
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {plan.name === 'Básico' ? '2' : 
                       plan.name === 'Profissional' ? '5' : 
                       'Ilimitadas'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Prontuário digital
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Suporte
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {plan.name === 'Básico' ? 'Chat' : 
                       plan.name === 'Profissional' ? 'Prioritário' : 
                       '24/7'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Relatórios médicos
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {plan.name === 'Básico' ? '❌' : '✅'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Perguntas Frequentes
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Posso cancelar a qualquer momento?
              </h4>
              <p className="text-gray-600">
                Sim, você pode cancelar sua assinatura a qualquer momento. 
                Não há taxas de cancelamento.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Como funcionam as consultas?
              </h4>
              <p className="text-gray-600">
                As consultas são realizadas por videochamada com médicos 
                certificados. Você pode agendar conforme sua disponibilidade.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Meus dados são seguros?
              </h4>
              <p className="text-gray-600">
                Sim, utilizamos criptografia de ponta a ponta para proteger 
                todas as suas informações médicas.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Posso trocar de plano?
              </h4>
              <p className="text-gray-600">
                Sim, você pode fazer upgrade ou downgrade do seu plano 
                a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
