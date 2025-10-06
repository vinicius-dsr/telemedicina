'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, CreditCard, Shield } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: string[]
}

export default function NewSubscriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')
  
  const [plan, setPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plans/${planId}`)
        if (response.ok) {
          const data = await response.json()
          setPlan(data.plan)
        } else {
          router.push('/plans')
        }
      } catch (error) {
        console.error('Erro ao carregar plano:', error)
        router.push('/plans')
      } finally {
        setIsLoading(false)
      }
    }

    if (!session) {
      router.push('/auth/login')
      return
    }

    if (planId) {
      fetchPlan()
    } else {
      router.push('/plans')
    }
  }, [session, planId, router])

  const handleSubscribe = async () => {
    if (!plan) return

    setIsSubscribing(true)

    try {
      // Aqui você implementaria a integração com gateway de pagamento
      // Por enquanto, vamos simular uma assinatura bem-sucedida
      
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod
        })
      })

      if (response.ok) {
        router.push('/dashboard?message=Assinatura criada com sucesso!')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao criar assinatura')
      }
    } catch (error) {
      console.error('Erro ao criar assinatura:', error)
      alert('Erro ao criar assinatura')
    } finally {
      setIsSubscribing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plano não encontrado</h1>
          <Link href="/plans">
            <Button>Voltar aos Planos</Button>
          </Link>
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
              <h1 className="text-2xl font-bold text-gray-900">Nova Assinatura</h1>
            </div>
            <Link href="/plans">
              <Button variant="outline">Voltar aos Planos</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Plano</CardTitle>
              <CardDescription>
                Confirme os detalhes da sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Recursos incluídos:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total mensal:</span>
                    <span className="text-xl font-bold">R$ {plan.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cobrança recorrente a cada {plan.duration} dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Pagamento</CardTitle>
              <CardDescription>
                Escolha sua forma de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Forma de Pagamento</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <span>Cartão de Crédito</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={paymentMethod === 'pix'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span>PIX</span>
                    </label>
                  </div>
                </div>

                {/* Credit Card Form (simplified) */}
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        disabled
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Validade</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/AA"
                          disabled
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="Nome como está no cartão"
                        disabled
                      />
                    </div>
                  </div>
                )}

                {/* PIX Info */}
                {paymentMethod === 'pix' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Após confirmar a assinatura, você receberá as instruções para pagamento via PIX.
                    </p>
                  </div>
                )}

                {/* Security Notice */}
                <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Pagamento seguro</p>
                    <p>Seus dados são protegidos com criptografia SSL</p>
                  </div>
                </div>

                {/* Subscribe Button */}
                <Button 
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="w-full"
                  size="lg"
                >
                  {isSubscribing ? 'Processando...' : `Assinar por R$ ${plan.price.toFixed(2)}/mês`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ao assinar, você concorda com nossos{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Termos de Uso
                  </Link>
                  {' '}e{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
