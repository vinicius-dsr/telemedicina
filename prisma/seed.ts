import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar planos
  const plans = [
    {
      name: 'Básico',
      description: 'Ideal para quem precisa de consultas ocasionais',
      price: 49.90,
      duration: 30,
      features: [
        '2 consultas por mês',
        'Prontuário digital',
        'Suporte por chat',
        'Acesso ao histórico médico',
        'Receitas digitais'
      ],
      isActive: true
    },
    {
      name: 'Profissional',
      description: 'Perfeito para acompanhamento regular',
      price: 99.90,
      duration: 30,
      features: [
        '5 consultas por mês',
        'Prontuário digital completo',
        'Suporte prioritário',
        'Relatórios médicos',
        'Acesso ao histórico médico',
        'Receitas digitais',
        'Agendamento prioritário'
      ],
      isActive: true
    },
    {
      name: 'Premium',
      description: 'Acesso ilimitado para toda a família',
      price: 199.90,
      duration: 30,
      features: [
        'Consultas ilimitadas',
        'Prontuário digital completo',
        'Suporte 24/7',
        'Relatórios médicos detalhados',
        'Acesso ao histórico médico',
        'Receitas digitais',
        'Agendamento prioritário',
        'Até 4 dependentes',
        'Telemedicina internacional'
      ],
      isActive: true
    }
  ]

  console.log('📋 Criando planos...')
  for (const plan of plans) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: plan.name }
    })

    if (existingPlan) {
      console.log(`✓ Plano "${plan.name}" já existe, atualizando...`)
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: plan
      })
    } else {
      console.log(`✓ Criando plano "${plan.name}"...`)
      await prisma.plan.create({
        data: plan
      })
    }
  }

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
