import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// Render의 DATABASE_URL 또는 개별 환경 변수로부터 연결 정보 추출
let poolConfig

if (process.env.DATABASE_URL) {
  // Render에서 제공하는 DATABASE_URL 사용
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Render는 연결 시간이 더 필요할 수 있음
  }
} else {
  // 개별 환경 변수 사용
  // Render 데이터베이스는 SSL이 필요하므로 호스트가 render.com이면 SSL 활성화
  const isRenderDB = process.env.DB_HOST && process.env.DB_HOST.includes('render.com')
  
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'coffee_order_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: isRenderDB ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: isRenderDB ? 10000 : 2000, // Render는 연결 시간이 더 필요
  }
}

// 데이터베이스 연결 풀 생성
const pool = new Pool(poolConfig)

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

