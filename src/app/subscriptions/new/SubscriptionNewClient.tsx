"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, CreditCard, Shield, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: string[]
}

export default function SubscriptionNewClient() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')
  
  const [plan, setPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    if (planId) {
      const fetchData = async () => {
        try {
          // Buscar plano e verificar assinatura em paralelo
          const [planResponse, subscriptionResponse] = await Promise.all([
            fetch(`/api/plans/${planId}`),
            fetch('/api/subscriptions/current')
          ])

          if (planResponse.ok) {
            const planData = await planResponse.json()
            setPlan(planData.plan)
          } else {
            toast.error('Plano não encontrado')
            router.push('/plans')
            return
          }

          if (subscriptionResponse.ok) {
            const subData = await subscriptionResponse.json()
            if (subData.subscription?.status === 'ACTIVE') {
              setHasActiveSubscription(true)
              toast.warning('Você já possui uma assinatura ativa')
            }
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error)
          toast.error('Erro ao carregar informações')
          router.push('/plans')
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    } else {
      router.push('/plans')
    }
  }, [session, planId, router])

  const handleSubscribe = async () => {
    if (!plan) return

    if (hasActiveSubscription) {
      toast.error('Você já possui uma assinatura ativa. Cancele-a antes de assinar um novo plano.')
      return
    }

    setIsSubscribing(true)

    try {
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

      const data = await response.json()

      if (response.ok) {
        toast.success('Assinatura criada com sucesso! 🎉')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        toast.error(data.error || 'Erro ao criar assinatura')
      }
    } catch (error) {
      console.error('Erro ao criar assinatura:', error)
      toast.error('Erro ao processar assinatura. Tente novamente.')
    } finally {
      setIsSubscribing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Plano não encontrado</h1>
          <Link href="/plans">
            <Button>Voltar aos Planos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">Nova Assinatura</h1>
            </div>
            <Link href="/plans">
              <Button variant="outline">Voltar aos Planos</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Aviso de assinatura ativa */}
        {hasActiveSubscription && (
          <Card className="mb-6 border-orange-300 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900">
                <AlertCircle className="h-5 w-5 mr-2" />
                Assinatura Ativa Detectada
              </CardTitle>
              <CardDescription className="text-orange-700">
                Você já possui uma assinatura ativa. Para assinar um novo plano, primeiro cancele sua assinatura atual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Ir para Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

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
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Recursos incluídos:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
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
                  <p className="text-xs text-muted-foreground mt-1">
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
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-primary"
                      />
                      <CreditCard className="h-5 w-5 text-muted-foreground/60" />
                      <span>Cartão de Crédito</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={paymentMethod === 'pix'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-primary"
                      />
                      <Shield className="h-5 w-5 text-muted-foreground/60" />
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
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary/80">
                      Após confirmar a assinatura, você receberá as instruções para pagamento via PIX.
                    </p>
                  </div>
                )}

                {/* Security Notice */}
                <div className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm text-foreground">
                    <p className="font-medium">Pagamento seguro</p>
                    <p>Seus dados são protegidos com criptografia SSL</p>
                  </div>
                </div>

                {/* Subscribe Button */}
                <Button 
                  onClick={handleSubscribe}
                  disabled={isSubscribing || hasActiveSubscription}
                  className="w-full"
                  size="lg"
                >
                  {isSubscribing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : hasActiveSubscription ? (
                    'Você já possui uma assinatura'
                  ) : (
                    `Assinar por R$ ${plan.price.toFixed(2)}/mês`
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ao assinar, você concorda com nossos{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Termos de Uso
                  </Link>
                  {' '}e{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
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
