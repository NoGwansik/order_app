import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/database.js'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 미들웨어
app.use(cors()) // CORS 설정 (프런트엔드와 통신을 위해)
app.use(express.json()) // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })) // URL 인코딩된 요청 본문 파싱

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '커피 주문 앱 API 서버',
    version: '1.0.0'
  })
})

// API 라우트
import menusRoutes from './routes/menus.js'
import ordersRoutes from './routes/orders.js'

app.use('/api/menus', menusRoutes)
app.use('/api/orders', ordersRoutes)

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다.' 
  })
})

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('에러 발생:', err)
  res.status(500).json({ 
    success: false,
    error: '서버 내부 오류가 발생했습니다.' 
  })
})

// 서버 시작
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`http://localhost:${PORT}`)
  
  // 데이터베이스 연결 테스트
  await testConnection()
})

