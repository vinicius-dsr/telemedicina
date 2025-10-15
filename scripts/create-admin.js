require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
      console.error('Variáveis ADMIN_EMAIL e ADMIN_PASSWORD não configuradas.')
      return
    }

    const existingAdmin = await prisma.user.findUnique({ where: { email } })

    if (existingAdmin) {
      console.log('Usuário admin já existe para o email configurado.')
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Usuário admin criado com sucesso.')
    console.log('ID:', admin.id)
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
