import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createPlans() {
  try {
    // Verificar se os planos já existem
    const existingPlans = await prisma.plan.findMany()
    
    if (existingPlans.length > 0) {
      console.log('Planos já existem!')
      return
    }

    // Criar planos
    const plans = await prisma.plan.createMany({
      data: [
        {
          name: 'Básico',
          description: 'Ideal para consultas ocasionais',
          price: 29.90,
          duration: 30,
          features: [
            '2 consultas por mês',
            'Prontuário digital',
            'Suporte por chat',
            'Acesso 24/7'
          ]
        },
        {
          name: 'Profissional',
          description: 'Para uso profissional regular',
          price: 59.90,
          duration: 30,
          features: [
            '5 consultas por mês',
            'Prontuário digital',
            'Suporte prioritário',
            'Relatórios médicos',
            'Acesso 24/7'
          ]
        },
        {
          name: 'Premium',
          description: 'Para uso intensivo',
          price: 99.90,
          duration: 30,
          features: [
            'Consultas ilimitadas',
            'Prontuário digital',
            'Suporte 24/7',
            'Relatórios médicos',
            'Telemedicina avançada',
            'Acesso prioritário'
          ]
        }
      ]
    })

    console.log('Planos criados com sucesso!')
    console.log('Planos criados:', plans.count)

  } catch (error) {
    console.error('Erro ao criar planos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createPlans()
