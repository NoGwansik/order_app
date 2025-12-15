import { testConnection } from './database.js'
import dotenv from 'dotenv'

dotenv.config()

// 환경 변수 확인 (비밀번호는 마스킹)
console.log('환경 변수 확인:')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '없음')
console.log('DB_HOST:', process.env.DB_HOST || '없음')
console.log('DB_PORT:', process.env.DB_PORT || '없음')
console.log('DB_NAME:', process.env.DB_NAME || '없음')
console.log('DB_USER:', process.env.DB_USER || '없음')
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '설정됨' : '없음')
console.log('NODE_ENV:', process.env.NODE_ENV || '없음')
console.log('')

// 연결 테스트
testConnection()
  .then(success => {
    if (success) {
      console.log('✅ 데이터베이스 연결 성공!')
      process.exit(0)
    } else {
      console.log('❌ 데이터베이스 연결 실패!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ 오류:', error)
    process.exit(1)
  })

