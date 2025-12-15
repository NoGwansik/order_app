# 커피 주문 앱 - 백엔드 서버

Express.js를 사용한 RESTful API 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

## 개발 서버 실행

```bash
npm run dev
```

또는

```bash
npm start
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## 프로젝트 구조

```
서버/
├── server.js          # 메인 서버 파일
├── routes/            # API 라우트 (추후 추가)
├── controllers/       # 컨트롤러 (추후 추가)
├── models/           # 데이터 모델 (추후 추가)
├── middleware/       # 미들웨어 (추후 추가)
├── config/           # 설정 파일 (추후 추가)
└── package.json      # 프로젝트 의존성
```

## API 엔드포인트

### 메뉴
- `GET /api/menus` - 메뉴 목록 조회

### 주문
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:orderId` - 주문 정보 조회
- `POST /api/orders` - 주문 생성
- `PATCH /api/orders/:orderId/status` - 주문 상태 업데이트

### 재고
- `PATCH /api/menus/:menuId/stock` - 재고 업데이트

## 기술 스택

- Node.js
- Express.js
- PostgreSQL (pg)
- CORS
- dotenv

