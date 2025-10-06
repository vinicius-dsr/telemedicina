const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = 'admin@example.com'
    // Verificar se o admin já existe
    const existingAdmin = await prisma.user.findUnique({ where: { email } })

    if (existingAdmin) {
      console.log('Usuário admin já existe!')
      console.log('Email:', email)
      return
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('REDACTED_PASSWORD', 12)

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Usuário admin criado com sucesso!')
    console.log('Email:', email)
    console.log('Senha: REDACTED_PASSWORD')
    console.log('ID:', admin.id)
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
