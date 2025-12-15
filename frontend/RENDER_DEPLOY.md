# 프런트엔드 Render 배포 가이드

## 배포 전 코드 수정 사항

### 1. API URL 환경 변수 설정
- `App.jsx`에 `API_URL` 상수 추가 완료
- 환경 변수 `VITE_API_URL` 사용 (없으면 기본값: `http://localhost:3001`)

### 2. 빌드 설정 확인
- `vite.config.js` 확인 완료
- `package.json`의 `build` 스크립트 확인 완료

## Render Static Site 배포 과정

### 1. Render.com 대시보드에서 "New" → "Static Site" 클릭

### 2. GitHub 저장소 연결
- Repository: 프로젝트 GitHub 저장소 선택
- Branch: `main` 또는 `master`

### 3. 기본 설정
- **Name**: `coffee-order-app` (원하는 이름)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 4. 환경 변수 설정 (선택사항)
"Environment Variables" 섹션에서:
```
VITE_API_URL=https://your-backend-url.onrender.com
```
- `your-backend-url.onrender.com`을 실제 백엔드 서비스 URL로 변경
- 예: `https://coffee-order-api.onrender.com`

### 5. 배포 시작
"Create Static Site" 클릭

## 배포 후 확인 사항

1. **빌드 성공 확인**: 로그에서 빌드가 성공했는지 확인
2. **사이트 URL 확인**: Render에서 제공하는 URL 확인
3. **API 연결 테스트**: 프런트엔드에서 백엔드 API 호출이 정상 작동하는지 확인

## 문제 해결

### 빌드 실패 시
- Root Directory가 `frontend`로 설정되었는지 확인
- Build Command가 올바른지 확인
- `package.json`의 `build` 스크립트 확인

### API 연결 실패 시
- `VITE_API_URL` 환경 변수가 올바르게 설정되었는지 확인
- 백엔드 서비스가 실행 중인지 확인
- CORS 설정 확인 (백엔드에서 프런트엔드 URL 허용)

