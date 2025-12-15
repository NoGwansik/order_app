import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pkg

// 데이터베이스 생성 스크립트
const createDatabase = async () => {
  // postgres 데이터베이스에 연결 (기본 데이터베이스)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // 기본 데이터베이스
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  })

  try {
    await client.connect()
    console.log('PostgreSQL에 연결되었습니다.')

    // 데이터베이스 존재 여부 확인
    const dbName = process.env.DB_NAME || 'coffee_order_db'
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`
    const dbExists = await client.query(checkDbQuery, [dbName])

    if (dbExists.rows.length === 0) {
      // 데이터베이스 생성
      await client.query(`CREATE DATABASE ${dbName}`)
      console.log(`데이터베이스 '${dbName}'가 생성되었습니다.`)
    } else {
      console.log(`데이터베이스 '${dbName}'가 이미 존재합니다.`)
    }

    await client.end()
  } catch (error) {
    console.error('데이터베이스 생성 오류:', error.message)
    await client.end()
    process.exit(1)
  }
}

createDatabase()

