import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// 데이터베이스 연결 풀 생성
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'coffee_order_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃
})

// 연결 테스트
pool.on('connect', () => {
  console.log('데이터베이스에 연결되었습니다.')
})

pool.on('error', (err) => {
  console.error('데이터베이스 연결 오류:', err)
})

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('데이터베이스 연결 성공:', result.rows[0])
    return true
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message)
    return false
  }
}

export default pool

