# 데이터베이스 확인 가이드

Render PostgreSQL 데이터베이스의 내용을 확인하는 여러 방법을 안내합니다.

## 방법 1: 조회 스크립트 사용 (가장 간단)

로컬에서 환경 변수를 설정한 후 다음 명령어를 실행하세요:

```bash
cd server
npm run view-data
```

이 스크립트는 다음 정보를 표시합니다:
- 메뉴 데이터
- 옵션 데이터
- 주문 데이터 (최근 10개)
- 주문 상세 데이터 (최근 10개)
- 통계 정보 (총 메뉴 수, 주문 수, 매출 등)

## 방법 2: Render Shell에서 psql 사용

### 2.1 Render Shell 접속
1. Render.com 대시보드 접속
2. 데이터베이스 페이지로 이동
3. 왼쪽 메뉴에서 **"Shell"** 클릭

### 2.2 psql로 데이터베이스 연결

**방법 A: DATABASE_URL 사용 (권장)**
```bash
psql $DATABASE_URL
```

**방법 B: 직접 연결**
```bash
psql -h your-db-host.render.com -U your-db-user -d your-db-name
```
- `your-db-host.render.com`: Render 대시보드의 Connections 탭에서 확인
- `your-db-user`: 데이터베이스 사용자명
- `your-db-name`: 데이터베이스 이름

### 2.3 유용한 SQL 명령어

```sql
-- 테이블 목록 확인
\dt

-- 테이블 구조 확인
\d menus
\d orders
\d order_items
\d options

-- 메뉴 데이터 조회
SELECT * FROM menus;

-- 주문 데이터 조회 (최신순)
SELECT * FROM orders ORDER BY order_date DESC;

-- 주문 상세 조회
SELECT 
  o.id as order_id,
  o.order_date,
  o.status,
  o.total_amount,
  m.name as menu_name,
  oi.quantity,
  oi.unit_price,
  oi.options
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN menus m ON oi.menu_id = m.id
ORDER BY o.order_date DESC
LIMIT 10;

-- 통계 조회
SELECT 
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'received' THEN 1 END) as received,
  COUNT(CASE WHEN status = 'in_production' THEN 1 END) as in_production,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM orders;

-- 재고 현황
SELECT id, name, stock FROM menus ORDER BY id;

-- psql 종료
\q
```

## 방법 3: 외부 데이터베이스 클라이언트 사용

### 3.1 pgAdmin 사용

1. **pgAdmin 다운로드 및 설치**
   - https://www.pgadmin.org/download/

2. **Render에서 연결 정보 확인**
   - Render 대시보드 → 데이터베이스 → "Connections" 탭
   - 다음 정보 확인:
     - Host
     - Port (보통 5432)
     - Database
     - User
     - Password

3. **pgAdmin에서 서버 추가**
   - 우클릭 "Servers" → "Create" → "Server"
   - **General 탭**:
     - Name: `Render DB` (원하는 이름)
   - **Connection 탭**:
     - Host name/address: `your-db-host.render.com`
     - Port: `5432`
     - Maintenance database: `your-db-name`
     - Username: `your-db-user`
     - Password: `your-db-password`
   - **SSL 탭**:
     - SSL mode: `Require`

4. **연결 후 데이터 확인**
   - 서버 연결 성공 후
   - Databases → your-db-name → Schemas → public → Tables
   - 테이블을 우클릭 → "View/Edit Data" → "All Rows"

### 3.2 DBeaver 사용

1. **DBeaver 다운로드 및 설치**
   - https://dbeaver.io/download/

2. **새 데이터베이스 연결 생성**
   - "New Database Connection" 클릭
   - PostgreSQL 선택

3. **연결 정보 입력**
   - Host: `your-db-host.render.com`
   - Port: `5432`
   - Database: `your-db-name`
   - Username: `your-db-user`
   - Password: `your-db-password`
   - **SSL 탭**: "Use SSL" 체크

4. **연결 후 데이터 확인**
   - 연결 성공 후 테이블을 더블클릭하여 데이터 확인

### 3.3 VS Code 확장 프로그램 사용

1. **PostgreSQL 확장 설치**
   - VS Code에서 "PostgreSQL" 확장 프로그램 설치

2. **연결 설정**
   - Command Palette (Ctrl+Shift+P) → "PostgreSQL: Add Connection"
   - Render 연결 정보 입력

## 방법 4: 백엔드 API를 통한 확인

배포된 백엔드 API 엔드포인트를 사용하여 데이터를 확인할 수 있습니다:

```bash
# 메뉴 목록 조회
curl https://your-backend-url.onrender.com/api/menus

# 주문 목록 조회
curl https://your-backend-url.onrender.com/api/orders

# 특정 주문 조회
curl https://your-backend-url.onrender.com/api/orders/1
```

또는 브라우저에서 직접 접속:
- `https://your-backend-url.onrender.com/api/menus`
- `https://your-backend-url.onrender.com/api/orders`

## 방법 5: 커스텀 SQL 쿼리 실행

특정 쿼리를 실행하고 싶다면 `server/config/runQuery.js` 파일을 만들 수 있습니다:

```javascript
import pool from './database.js'

const query = process.argv[2] || 'SELECT * FROM menus'

const runQuery = async () => {
  const client = await pool.connect()
  try {
    const result = await client.query(query)
    console.table(result.rows)
  } catch (error) {
    console.error('쿼리 실행 오류:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runQuery()
```

사용법:
```bash
npm run query "SELECT * FROM orders WHERE status = 'completed'"
```

## 권장 방법

- **빠른 확인**: 방법 1 (조회 스크립트)
- **상세 분석**: 방법 2 (Render Shell + psql)
- **시각적 확인**: 방법 3 (pgAdmin 또는 DBeaver)
- **API 테스트**: 방법 4 (백엔드 API)

## 문제 해결

### 연결 실패 시
- SSL 설정 확인 (Render는 SSL 필수)
- 방화벽 설정 확인
- 연결 정보 재확인 (Render 대시보드)

### 권한 오류 시
- 데이터베이스 사용자 권한 확인
- Render 대시보드에서 연결 정보 재확인

