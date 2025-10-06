const { Client } = require('pg')
require('dotenv').config()

async function tryConnect(name, connString) {
  const client = new Client({ connectionString: connString, ssl: { rejectUnauthorized: false } })
  try {
    console.log(`Tentando conectar usando ${name}...`)
    await client.connect()
    console.log(`${name}: Conectado ao banco com sucesso`)
    const res = await client.query("SELECT id, email, name FROM users WHERE email = 'admin@example.com'")
    console.log(`${name}: Resultado:`, res.rows)
  } catch (err) {
    console.error(`${name}: Erro ao conectar/consultar DB:`, err)
  } finally {
    try { await client.end() } catch (e) {}
  }
}

async function run() {
  const dbUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_URL

  if (dbUrl) await tryConnect('DATABASE_URL', dbUrl)
  if (directUrl) await tryConnect('DIRECT_URL', directUrl)
}

run()
