# Render 배포 가이드 - 데이터베이스 스키마 생성

## 방법 1: Render Shell을 통한 실행 (권장)

Render 데이터베이스는 보안상 외부에서 직접 연결이 제한될 수 있습니다. Render Shell을 통해 실행하는 것이 가장 안전합니다.

### 단계:

1. **Render.com 대시보드 접속**
   - 백엔드 서비스 페이지로 이동

2. **Shell 탭 열기**
   - 왼쪽 메뉴에서 "Shell" 클릭
   - 또는 서비스 페이지에서 "Shell" 버튼 클릭

3. **다음 명령어 실행:**
   ```bash
   npm run create-tables
   ```

4. **결과 확인**
   - 테이블 생성 및 초기 데이터 삽입 완료 메시지 확인

## 방법 2: 백엔드 서버 시작 시 자동 실행

서버가 시작될 때 자동으로 테이블을 생성하도록 설정할 수 있습니다.

`server.js`에 다음 코드를 추가:

```javascript
import { testConnection } from './config/database.js'
import pool from './config/database.js'

// 서버 시작 시 테이블 생성 확인
const initializeDatabase = async () => {
  try {
    const client = await pool.connect()
    
    // menus 테이블 존재 확인
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'menus'
      )
    `)
    
    if (!tableCheck.rows[0].exists) {
      console.log('테이블이 없습니다. 생성 스크립트를 실행하세요.')
      console.log('Render Shell에서 다음 명령어를 실행하세요: npm run create-tables')
    }
    
    client.release()
  } catch (error) {
    console.error('데이터베이스 초기화 확인 오류:', error)
  }
}

// 서버 시작
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`http://localhost:${PORT}`)
  
  // 데이터베이스 연결 테스트
  await testConnection()
  
  // 데이터베이스 초기화 확인
  await initializeDatabase()
})
```

## 방법 3: 로컬에서 실행 (Render 데이터베이스 외부 연결 허용 시)

Render 데이터베이스 설정에서 "Allow External Connections" 옵션이 활성화되어 있어야 합니다.

1. **환경 변수 확인**
   - `.env` 파일에 `DATABASE_URL` 또는 개별 DB 정보가 올바르게 설정되어 있는지 확인

2. **연결 테스트**
   ```bash
   cd 서버
   npm run create-tables
   ```

## 환경 변수 설정

Render에서 제공하는 환경 변수:

- `DATABASE_URL`: 전체 연결 문자열 (권장)
  - 형식: `postgresql://user:password@host:port/database?sslmode=require`

또는 개별 변수:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

## 문제 해결

### 연결 오류 발생 시:

1. **DATABASE_URL 확인**
   - Render 대시보드에서 데이터베이스의 "Connections" 탭 확인
   - 내부 데이터베이스 URL 복사

2. **SSL 설정 확인**
   - Render는 SSL 연결을 요구합니다
   - `database.js`에서 SSL 설정이 올바른지 확인

3. **방화벽 확인**
   - Render 데이터베이스는 기본적으로 외부 연결을 차단합니다
   - Render Shell을 통해 실행하는 것이 가장 안전합니다

