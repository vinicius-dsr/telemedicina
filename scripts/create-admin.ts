import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Verificar se o admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })

    if (existingAdmin) {
      console.log('Usuário admin já existe!')
      return
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('REDACTED_PASSWORD', 12)

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Usuário admin criado com sucesso!')
    console.log('Email: admin@example.com')
    console.log('Senha: REDACTED_PASSWORD')
    console.log('ID:', admin.id)

  } catch (error) {
    console.error('Erro ao criar usuário admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
