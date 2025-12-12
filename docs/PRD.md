# 커피 주문 앱 PRD

## 1. 프로젝트 개요

### 1.1 프로젝트명
커피 주문 앱

### 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 간단한 풀스택 웹 앱

### 1.3 개발 범위
- 주문하기 화면(메뉴 선택 및 장바구니 기능)
- 관리자 화면(재고 관리 및 주문 상태 관리)
- 데이터를 생성/조회/수정/삭제할 수 있는 기능

## 2. 기술 스택
- **프런트엔드**: HTML, CSS, 리액트, 자바스크립트
- **백엔드**: Node.js, Express
- **데이터베이스**: PostgreSQL

## 3. 기본 사항
- 프런트엔드와 백엔드를 따로 개발
- 기본적인 웹 기술만 사용
- 학습 목적이므로 사용자 인증이나 결제 기능은 제외
- 메뉴는 커피 메뉴만 있음

## 4. 주문하기 화면 상세 요구사항

### 4.1 화면 구성

#### 4.1.1 헤더 영역
- **브랜드명**: 좌측 상단에 "COZY" 표시
- **네비게이션 버튼**: 우측 상단에 두 개의 버튼
  - "주문하기" 버튼 (현재 화면 활성화 상태 표시)
  - "관리자" 버튼 (관리자 화면으로 이동)

#### 4.1.2 메뉴 아이템 영역
각 메뉴 아이템은 다음 요소로 구성됩니다:

- **메뉴 이미지**: 메뉴별 이미지 표시 영역
- **메뉴명**: 메뉴 이름 (예: "아메리카노(ICE)", "아메리카노(HOT)", "카페라떼")
- **가격**: 메뉴 기본 가격 (예: "4,000원", "5,000원")
- **설명**: 메뉴에 대한 간단한 설명 텍스트
- **옵션 선택**:
  - "샷 추가 (+500원)" 체크박스
  - "시럽 추가 (+0원)" 체크박스
- **담기 버튼**: 선택한 옵션과 함께 장바구니에 추가하는 버튼

#### 4.1.3 장바구니 영역
- **제목**: "장바구니" 표시
- **장바구니 아이템 목록**:
  - 각 아이템은 다음 정보를 표시:
    - 메뉴명과 선택한 옵션 (예: "아메리카노(ICE) (샷 추가)")
    - 수량 (예: "x 1", "x 2")
    - 해당 아이템의 총 가격
- **총 금액**: "총 금액 [금액]원" 형식으로 표시
- **주문하기 버튼**: 장바구니의 모든 아이템을 주문하는 버튼

### 4.2 기능 요구사항

#### 4.2.1 메뉴 조회
- 서버에서 커피 메뉴 목록을 조회하여 화면에 표시
- 각 메뉴의 이미지, 이름, 가격, 설명 정보 표시

#### 4.2.2 옵션 선택
- 사용자는 각 메뉴에 대해 다음 옵션을 선택할 수 있음:
  - 샷 추가: 선택 시 +500원 추가
  - 시럽 추가: 선택 시 +0원 (가격 변동 없음)
- 여러 옵션을 동시에 선택 가능

#### 4.2.3 장바구니 기능
- **담기**: 메뉴와 선택한 옵션을 장바구니에 추가
  - 동일한 메뉴와 옵션 조합이 이미 장바구니에 있으면 수량 증가
  - 다른 옵션 조합이면 별도 아이템으로 추가
- **수량 표시**: 각 아이템의 수량을 표시
- **가격 계산**: 
  - 각 아이템의 가격 = (기본 가격 + 옵션 추가 가격) × 수량
  - 총 금액 = 모든 장바구니 아이템 가격의 합계
- **실시간 업데이트**: 장바구니에 아이템이 추가/변경될 때마다 총 금액 자동 업데이트

#### 4.2.4 주문하기
- 장바구니에 아이템이 있을 때만 "주문하기" 버튼 활성화
- 주문하기 버튼 클릭 시:
  - 장바구니의 모든 아이템 정보를 서버로 전송
  - 주문이 성공적으로 생성되면 장바구니 초기화
  - 주문 완료 메시지 표시 (선택사항)

### 4.3 데이터 구조

#### 4.3.1 메뉴 데이터
```javascript
{
  id: number,
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  temperature: string, // "HOT" or "ICE"
  stock: number // 재고 수량
}
```

#### 4.3.2 장바구니 아이템 데이터
```javascript
{
  menuId: number,
  menuName: string,
  basePrice: number,
  options: {
    addShot: boolean, // 샷 추가 여부
    addSyrup: boolean // 시럽 추가 여부
  },
  quantity: number,
  totalPrice: number // (basePrice + optionPrice) * quantity
}
```

#### 4.3.3 주문 요청 데이터
```javascript
{
  items: [
    {
      menuId: number,
      menuName: string,
      options: {
        addShot: boolean,
        addSyrup: boolean
      },
      quantity: number,
      price: number
    }
  ],
  totalAmount: number
}
```

### 4.4 UI/UX 요구사항
- 메뉴 아이템은 가로로 배치하여 한 화면에 여러 메뉴를 볼 수 있도록 구성
- 장바구니는 화면 하단 또는 측면에 고정되어 항상 확인 가능
- 버튼 클릭 시 명확한 피드백 제공
- 가격 정보는 천 단위 구분 기호(쉼표) 사용하여 표시
- 옵션 선택 시 실시간으로 가격 변동 반영 (선택사항)

## 5. 관리자 화면 상세 요구사항

### 5.1 화면 구성

#### 5.1.1 헤더 영역
- **브랜드명**: 좌측 상단에 "COZY" 표시
- **네비게이션 버튼**: 우측 상단에 두 개의 버튼
  - "주문하기" 버튼 (주문하기 화면으로 이동)
  - "관리자" 버튼 (현재 화면 활성화 상태 표시)

#### 5.1.2 관리자 대시보드 영역
- **제목**: "관리자 대시보드" 표시
- **주문 통계 요약**: 다음 정보를 한 줄로 표시
  - 총 주문 수
  - 주문 접수 수
  - 제조 중 수
  - 제조 완료 수
  - 형식: "총 주문 [N] / 주문 접수 [N] / 제조 중 [N] / 제조 완료 [N]"

#### 5.1.3 재고 현황 영역
- **제목**: "재고 현황" 표시
- **재고 아이템 목록**: 각 메뉴별로 다음 정보 표시
  - 메뉴명 (예: "아메리카노 (ICE)", "아메리카노 (HOT)", "카페라떼")
  - 현재 재고 수량 (예: "10개")
  - 재고 조정 버튼:
    - 증가 버튼 (+)
    - 감소 버튼 (-)

#### 5.1.4 주문 현황 영역
- **제목**: "주문 현황" 표시
- **주문 목록**: 각 주문은 다음 정보를 표시
  - 주문 일시 (예: "7월 31일 13:00")
  - 주문 아이템 정보 (예: "아메리카노(ICE) x 1")
  - 주문 금액 (예: "4,000원")
  - 주문 상태에 따른 액션 버튼:
    - "주문 접수" 버튼 (주문이 접수 대기 상태일 때)
    - "제조 시작" 버튼 (주문 접수 후)
    - "제조 완료" 버튼 (제조 중일 때)

### 5.2 기능 요구사항

#### 5.2.1 대시보드 통계 조회
- 서버에서 주문 통계 데이터를 조회하여 실시간으로 표시
- 주문 상태별 개수를 자동으로 계산하여 표시
- 화면 로드 시 및 주문 상태 변경 시 자동 업데이트

#### 5.2.2 재고 관리
- **재고 조회**: 서버에서 모든 메뉴의 현재 재고 수량을 조회하여 표시
- **재고 증가**: 증가 버튼 클릭 시 해당 메뉴의 재고를 1개 증가
  - 서버에 재고 업데이트 요청 전송
  - 성공 시 화면에 반영
- **재고 감소**: 감소 버튼 클릭 시 해당 메뉴의 재고를 1개 감소
  - 재고가 0보다 클 때만 감소 가능
  - 서버에 재고 업데이트 요청 전송
  - 성공 시 화면에 반영
- **실시간 업데이트**: 재고 변경 시 즉시 화면에 반영

#### 5.2.3 주문 현황 관리
- **주문 목록 조회**: 서버에서 주문 목록을 조회하여 표시
  - 주문은 최신순으로 정렬하여 표시
  - 각 주문의 상태에 따라 적절한 액션 버튼 표시
- **주문 접수**: "주문 접수" 버튼 클릭 시
  - 주문 상태를 "주문 접수"로 변경
  - 서버에 주문 상태 업데이트 요청 전송
  - 대시보드 통계 자동 업데이트
  - 해당 주문의 액션 버튼이 "제조 시작"으로 변경
- **제조 시작**: "제조 시작" 버튼 클릭 시
  - 주문 상태를 "제조 중"으로 변경
  - 서버에 주문 상태 업데이트 요청 전송
  - 대시보드 통계 자동 업데이트
  - 해당 주문의 액션 버튼이 "제조 완료"로 변경
- **제조 완료**: "제조 완료" 버튼 클릭 시
  - 주문 상태를 "제조 완료"로 변경
  - 서버에 주문 상태 업데이트 요청 전송
  - 대시보드 통계 자동 업데이트
  - 해당 주문의 액션 버튼 제거 또는 비활성화

### 5.3 데이터 구조

#### 5.3.1 대시보드 통계 데이터
```javascript
{
  totalOrders: number,
  receivedOrders: number,
  inProductionOrders: number,
  completedOrders: number
}
```

#### 5.3.2 재고 데이터
```javascript
{
  menuId: number,
  menuName: string,
  stock: number
}
```

#### 5.3.3 주문 현황 데이터
```javascript
{
  orderId: number,
  orderDate: string, // "YYYY-MM-DD HH:mm" 형식
  items: [
    {
      menuName: string,
      quantity: number,
      price: number
    }
  ],
  totalAmount: number,
  status: string // "pending" | "received" | "in_production" | "completed"
}
```

#### 5.3.4 재고 업데이트 요청 데이터
```javascript
{
  menuId: number,
  change: number // +1 또는 -1
}
```

#### 5.3.5 주문 상태 업데이트 요청 데이터
```javascript
{
  orderId: number,
  status: string // "received" | "in_production" | "completed"
}
```

### 5.4 UI/UX 요구사항
- 대시보드, 재고 현황, 주문 현황을 명확하게 구분하여 표시
- 주문 목록은 최신 주문이 상단에 오도록 정렬
- 주문 상태에 따라 적절한 액션 버튼만 표시
- 재고 수량은 명확하게 표시하고, 증감 버튼은 직관적으로 배치
- 버튼 클릭 시 명확한 피드백 제공
- 주문 상태 변경 시 대시보드 통계가 실시간으로 업데이트
- 가격 정보는 천 단위 구분 기호(쉼표) 사용하여 표시

## 6. 백엔드 개발 요구사항

### 6.1 데이터 모델

#### 6.1.1 Menus (메뉴)
커피 메뉴 정보를 저장하는 테이블입니다.

**필드:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT): 메뉴 고유 ID
- `name` (VARCHAR): 커피 이름 (예: "아메리카노(ICE)", "카페라떼")
- `description` (TEXT): 메뉴 설명
- `price` (INTEGER): 기본 가격 (원 단위)
- `image_url` (VARCHAR): 이미지 URL
- `stock` (INTEGER): 재고 수량
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**예시 데이터:**
```sql
INSERT INTO menus (name, description, price, image_url, stock) VALUES
('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, '', 10),
('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, '', 10),
('카페라떼', '부드러운 카페라떼', 5000, '', 10);
```

#### 6.1.2 Options (옵션)
메뉴에 추가할 수 있는 옵션 정보를 저장하는 테이블입니다.

**필드:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT): 옵션 고유 ID
- `name` (VARCHAR): 옵션 이름 (예: "샷 추가", "시럽 추가")
- `price` (INTEGER): 옵션 추가 가격 (원 단위)
- `menu_id` (INTEGER, FOREIGN KEY): 연결할 메뉴 ID (NULL이면 모든 메뉴에 적용 가능)
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**예시 데이터:**
```sql
INSERT INTO options (name, price, menu_id) VALUES
('샷 추가', 500, NULL),
('시럽 추가', 0, NULL);
```

#### 6.1.3 Orders (주문)
주문 정보를 저장하는 테이블입니다.

**필드:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT): 주문 고유 ID
- `order_date` (TIMESTAMP): 주문 일시
- `status` (VARCHAR): 주문 상태 ("pending", "received", "in_production", "completed")
- `total_amount` (INTEGER): 총 주문 금액 (원 단위)
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**예시 데이터:**
```sql
INSERT INTO orders (order_date, status, total_amount) VALUES
('2024-12-12 14:35:00', 'pending', 36500);
```

#### 6.1.4 OrderItems (주문 상세)
주문에 포함된 메뉴와 옵션 정보를 저장하는 테이블입니다.

**필드:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT): 주문 상세 고유 ID
- `order_id` (INTEGER, FOREIGN KEY): 주문 ID
- `menu_id` (INTEGER, FOREIGN KEY): 메뉴 ID
- `quantity` (INTEGER): 수량
- `unit_price` (INTEGER): 단가 (메뉴 가격 + 옵션 가격)
- `options` (JSON 또는 TEXT): 선택한 옵션 정보 (예: {"addShot": true, "addSyrup": false})
- `created_at` (TIMESTAMP): 생성 일시

**예시 데이터:**
```sql
INSERT INTO order_items (order_id, menu_id, quantity, unit_price, options) VALUES
(1, 1, 1, 4500, '{"addShot": true, "addSyrup": false}'),
(1, 1, 8, 4000, '{"addShot": false, "addSyrup": false}');
```

### 6.2 데이터 스키마를 위한 사용자 흐름

#### 6.2.1 메뉴 조회 및 표시
1. **프런트엔드 요청**: 주문하기 화면 로드 시 메뉴 목록 조회 API 호출
2. **백엔드 처리**: 
   - `Menus` 테이블에서 모든 메뉴 정보 조회
   - 재고 수량(`stock`) 포함하여 응답
3. **프런트엔드 표시**:
   - 주문하기 화면: 메뉴 이름, 설명, 가격, 이미지 표시 (재고 수량은 표시하지 않음)
   - 관리자 화면: 메뉴 이름과 재고 수량 표시

#### 6.2.2 장바구니 관리
1. **사용자 액션**: 주문하기 화면에서 커피 메뉴 선택 및 옵션 선택
2. **프런트엔드 처리**: 
   - 선택한 메뉴와 옵션 정보를 장바구니 상태에 저장
   - 장바구니 화면에 선택 정보 표시
3. **데이터 저장**: 이 단계에서는 서버에 저장하지 않음 (클라이언트 상태 관리)

#### 6.2.3 주문 생성
1. **사용자 액션**: 장바구니에서 "주문하기" 버튼 클릭
2. **프런트엔드 요청**: 주문 생성 API 호출
   - 주문 시간 (현재 시간)
   - 주문 내용 (메뉴 ID, 수량, 옵션, 금액)
   - 총 금액
3. **백엔드 처리**:
   - `Orders` 테이블에 주문 정보 저장 (상태: "pending")
   - `OrderItems` 테이블에 주문 상세 정보 저장
   - 주문 성공 응답 반환
4. **프런트엔드 처리**: 장바구니 초기화 및 주문 완료 메시지 표시

#### 6.2.4 주문 현황 조회 및 상태 변경
1. **프런트엔드 요청**: 관리자 화면 로드 시 주문 목록 조회 API 호출
2. **백엔드 처리**: 
   - `Orders` 테이블에서 모든 주문 조회 (최신순 정렬)
   - 각 주문의 `OrderItems` 정보 포함하여 응답
3. **프런트엔드 표시**: 관리자 화면의 주문 현황에 표시
4. **상태 변경**:
   - 관리자가 "주문 접수" 버튼 클릭 → 상태를 "received"로 변경
   - 관리자가 "제조 시작" 버튼 클릭 → 상태를 "in_production"으로 변경
   - 관리자가 "제조 완료" 버튼 클릭 → 상태를 "completed"로 변경 및 재고 감소

### 6.3 API 설계

#### 6.3.1 메뉴 목록 조회
**엔드포인트**: `GET /api/menus`

**설명**: 데이터베이스에서 커피 메뉴 목록을 불러와서 반환합니다.

**요청**: 없음

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "description": "시원한 아이스 아메리카노",
      "price": 4000,
      "imageUrl": "",
      "stock": 10
    },
    {
      "id": 2,
      "name": "아메리카노(HOT)",
      "description": "따뜻한 핫 아메리카노",
      "price": 4000,
      "imageUrl": "",
      "stock": 10
    },
    {
      "id": 3,
      "name": "카페라떼",
      "description": "부드러운 카페라떼",
      "price": 5000,
      "imageUrl": "",
      "stock": 10
    }
  ]
}
```

**에러 응답**:
```json
{
  "success": false,
  "error": "메뉴 조회 중 오류가 발생했습니다."
}
```

#### 6.3.2 주문 생성
**엔드포인트**: `POST /api/orders`

**설명**: 사용자가 주문하기 버튼을 누르면 주문 정보를 데이터베이스에 저장합니다.

**요청 본문**:
```json
{
  "items": [
    {
      "menuId": 1,
      "menuName": "아메리카노(ICE)",
      "quantity": 1,
      "price": 4500,
      "options": {
        "addShot": true,
        "addSyrup": false
      }
    },
    {
      "menuId": 1,
      "menuName": "아메리카노(ICE)",
      "quantity": 8,
      "price": 4000,
      "options": {
        "addShot": false,
        "addSyrup": false
      }
    }
  ],
  "totalAmount": 36500
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "orderDate": "2024-12-12T14:35:00.000Z",
    "status": "pending",
    "totalAmount": 36500
  }
}
```

**에러 응답**:
```json
{
  "success": false,
  "error": "주문 생성 중 오류가 발생했습니다."
}
```

#### 6.3.3 주문 정보 조회
**엔드포인트**: `GET /api/orders/:orderId`

**설명**: 주문 ID를 전달하면 해당 주문 정보를 반환합니다.

**요청 파라미터**:
- `orderId` (URL 파라미터): 조회할 주문 ID

**응답**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderDate": "2024-12-12T14:35:00.000Z",
    "status": "pending",
    "totalAmount": 36500,
    "items": [
      {
        "id": 1,
        "menuId": 1,
        "menuName": "아메리카노(ICE)",
        "quantity": 1,
        "unitPrice": 4500,
        "options": {
          "addShot": true,
          "addSyrup": false
        }
      },
      {
        "id": 2,
        "menuId": 1,
        "menuName": "아메리카노(ICE)",
        "quantity": 8,
        "unitPrice": 4000,
        "options": {
          "addShot": false,
          "addSyrup": false
        }
      }
    ]
  }
}
```

**에러 응답**:
```json
{
  "success": false,
  "error": "주문을 찾을 수 없습니다."
}
```

#### 6.3.4 주문 목록 조회
**엔드포인트**: `GET /api/orders`

**설명**: 모든 주문 목록을 조회합니다 (관리자 화면용).

**요청**: 없음 (또는 쿼리 파라미터로 필터링 가능)

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderDate": "2024-12-12T14:35:00.000Z",
      "status": "completed",
      "totalAmount": 36500,
      "items": [
        {
          "menuId": 1,
          "menuName": "아메리카노(ICE)",
          "quantity": 1,
          "unitPrice": 4500,
          "options": {
            "addShot": true,
            "addSyrup": false
          }
        },
        {
          "menuId": 1,
          "menuName": "아메리카노(ICE)",
          "quantity": 8,
          "unitPrice": 4000,
          "options": {
            "addShot": false,
            "addSyrup": false
          }
        }
      ]
    }
  ]
}
```

#### 6.3.5 주문 상태 업데이트
**엔드포인트**: `PATCH /api/orders/:orderId/status`

**설명**: 주문 상태를 변경합니다 (주문 접수, 제조 시작, 제조 완료).

**요청 파라미터**:
- `orderId` (URL 파라미터): 상태를 변경할 주문 ID

**요청 본문**:
```json
{
  "status": "received"
}
```

**가능한 상태 값**:
- `"received"`: 주문 접수
- `"in_production"`: 제조 중
- `"completed"`: 제조 완료

**응답**:
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "status": "received"
  }
}
```

**특별 처리**:
- 상태가 "completed"로 변경될 때:
  - 주문에 포함된 각 메뉴의 수량만큼 `Menus` 테이블의 `stock` 값을 감소시킵니다.
  - 같은 메뉴가 여러 번 주문되었을 경우 모든 수량을 합산하여 감소시킵니다.

**에러 응답**:
```json
{
  "success": false,
  "error": "주문 상태 업데이트 중 오류가 발생했습니다."
}
```

#### 6.3.6 재고 업데이트
**엔드포인트**: `PATCH /api/menus/:menuId/stock`

**설명**: 관리자가 재고를 수동으로 증가 또는 감소시킵니다.

**요청 파라미터**:
- `menuId` (URL 파라미터): 재고를 변경할 메뉴 ID

**요청 본문**:
```json
{
  "change": 1
}
```

**요청 본문 설명**:
- `change`: 재고 변경량 (양수: 증가, 음수: 감소)
  - 예: `{"change": 1}` → 재고 1개 증가
  - 예: `{"change": -1}` → 재고 1개 감소

**응답**:
```json
{
  "success": true,
  "data": {
    "menuId": 1,
    "stock": 11
  }
}
```

**에러 응답**:
```json
{
  "success": false,
  "error": "재고가 부족합니다." // 재고가 0 이하로 감소하려고 할 때
}
```

또는

```json
{
  "success": false,
  "error": "재고 업데이트 중 오류가 발생했습니다."
}
```

### 6.4 데이터베이스 관계

#### 6.4.1 테이블 관계도
```
Menus (1) ──< (N) OrderItems (N) >── (1) Orders
  │
  │ (1)
  │
  └──< (N) Options
```

#### 6.4.2 외래 키 제약조건
- `OrderItems.menu_id` → `Menus.id` (CASCADE DELETE)
- `OrderItems.order_id` → `Orders.id` (CASCADE DELETE)
- `Options.menu_id` → `Menus.id` (SET NULL, 옵션)

### 6.5 추가 고려사항

#### 6.5.1 트랜잭션 처리
- 주문 생성 시 `Orders`와 `OrderItems` 테이블에 동시에 데이터를 저장해야 하므로 트랜잭션을 사용하여 원자성을 보장해야 합니다.
- 주문 상태를 "completed"로 변경하고 재고를 감소시킬 때도 트랜잭션을 사용하여 데이터 일관성을 유지해야 합니다.

#### 6.5.2 에러 처리
- 재고 부족 시 주문 생성 방지
- 존재하지 않는 메뉴 ID로 주문 생성 시도 시 에러 처리
- 존재하지 않는 주문 ID로 조회 시 에러 처리

#### 6.5.3 데이터 검증
- 주문 생성 시 필수 필드 검증 (menuId, quantity, price 등)
- 재고 업데이트 시 재고가 0 이하로 내려가지 않도록 검증
- 주문 상태 변경 시 유효한 상태 값인지 검증
