# 이미지 폴더

이 폴더에 커피 메뉴 이미지를 넣어주세요.

## 이미지 파일명

- `americano-ice.jpg` - 아메리카노(ICE) 이미지
- `americano-hot.jpg` - 아메리카노(HOT) 이미지
- `cafe-latte.jpg` - 카페라떼 이미지

## 이미지 권장 사양

- 형식: JPG, PNG, WebP
- 크기: 400x300px 이상 권장
- 비율: 4:3 또는 16:9
- 용량: 200KB 이하 권장 (로딩 속도 향상)

## 사용 방법

1. 이미지 파일을 이 폴더에 넣으세요
2. 파일명은 위의 이름과 일치시켜주세요
3. 또는 `App.jsx`에서 `imageUrl` 경로를 수정하세요

## 외부 이미지 URL 사용

외부 이미지 URL을 사용하려면 `App.jsx`의 `initialMenus`에서 `imageUrl`을 외부 URL로 변경하세요.

예:
```javascript
imageUrl: 'https://example.com/images/coffee.jpg'
```
