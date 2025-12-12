import { useState } from 'react'
import './App.css'

// 임시 메뉴 데이터
const initialMenus = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원한 아이스 아메리카노',
    imageUrl: '',
    temperature: 'ICE',
    stock: 10
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻한 핫 아메리카노',
    imageUrl: '',
    temperature: 'HOT',
    stock: 10
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 카페라떼',
    imageUrl: '',
    temperature: 'HOT',
    stock: 10
  }
]

function App() {
  const [menus] = useState(initialMenus)
  const [cart, setCart] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})

  // 옵션 선택 핸들러
  const handleOptionChange = (menuId, option, checked) => {
    setSelectedOptions(prev => ({
      ...prev,
      [menuId]: {
        addShot: prev[menuId]?.addShot || false,
        addSyrup: prev[menuId]?.addSyrup || false,
        [option]: checked
      }
    }))
  }

  // 장바구니에 추가
  const addToCart = (menu) => {
    // 현재 선택된 옵션 가져오기 (없으면 기본값)
    const options = {
      addShot: selectedOptions[menu.id]?.addShot || false,
      addSyrup: selectedOptions[menu.id]?.addSyrup || false
    }
    
    // 옵션에 따른 추가 가격 계산
    const optionPrice = (options.addShot ? 500 : 0) + (options.addSyrup ? 0 : 0)
    const unitPrice = menu.price + optionPrice

    // 장바구니에서 동일한 메뉴와 옵션 조합 찾기
    // 같은 메뉴 ID + 같은 옵션 조합이면 수량 증가, 아니면 새 항목 추가
    const existingItemIndex = cart.findIndex(
      item => {
        if (item.menuId !== menu.id) return false
        
        const itemAddShot = Boolean(item.options?.addShot)
        const itemAddSyrup = Boolean(item.options?.addSyrup)
        const newAddShot = Boolean(options.addShot)
        const newAddSyrup = Boolean(options.addSyrup)
        
        return itemAddShot === newAddShot && itemAddSyrup === newAddSyrup
      }
    )

    if (existingItemIndex >= 0) {
      // 동일한 메뉴와 옵션 조합이 이미 장바구니에 있음 → 수량만 증가
      // 기존 아이템 불변성 보장을 위해 map으로 새 cart 생성
      setCart(cart.map((item, idx) => {
        if (idx === existingItemIndex) {
          const newQuantity = item.quantity + 1
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: unitPrice * newQuantity
          }
        }
        return item
      }))
    } else {
      // 다른 메뉴이거나 다른 옵션 조합 → 새 항목으로 추가
      const newItem = {
        menuId: menu.id,
        menuName: menu.name,
        basePrice: menu.price,
        options: { 
          addShot: options.addShot, 
          addSyrup: options.addSyrup 
        },
        quantity: 1,
        totalPrice: unitPrice
      }
      setCart([...cart, newItem])
    }

    // 옵션 선택 초기화 (담기 후 옵션 체크박스 해제)
    setSelectedOptions(prev => ({
      ...prev,
      [menu.id]: { addShot: false, addSyrup: false }
    }))
  }

  // 총 금액 계산
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  // 주문하기
  const handleOrder = () => {
    if (cart.length === 0) return

    const orderData = {
      items: cart.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        options: item.options,
        quantity: item.quantity,
        price: item.totalPrice / item.quantity
      })),
      totalAmount: calculateTotal()
    }

    console.log('주문 데이터:', orderData)
    alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
    setCart([])
  }

  // 가격 포맷팅
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR')
  }

  // 옵션 텍스트 생성
  const getOptionText = (options) => {
    const parts = []
    if (options.addShot) parts.push('샷 추가')
    if (options.addSyrup) parts.push('시럽 추가')
    return parts.length > 0 ? ` (${parts.join(', ')})` : ''
  }

  return (
    <div className="App">
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          <h1 className="brand">COZY</h1>
          <nav className="nav-buttons">
            <button className="nav-button active">주문하기</button>
            <button className="nav-button">관리자</button>
          </nav>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {/* 메뉴 아이템 영역 */}
        <section className="menu-section">
          <div className="menu-grid">
            {menus.map(menu => {
              const options = selectedOptions[menu.id] || { addShot: false, addSyrup: false }
              const optionPrice = (options.addShot ? 500 : 0) + (options.addSyrup ? 0 : 0)
              const displayPrice = menu.price + optionPrice

              return (
                <div key={menu.id} className="menu-card">
                  <div className="menu-image">
                    <div className="image-placeholder">이미지</div>
                  </div>
                  <div className="menu-info">
                    <h3 className="menu-name">{menu.name}</h3>
                    <p className="menu-price">{formatPrice(displayPrice)}원</p>
                    <p className="menu-description">{menu.description}</p>
                    <div className="menu-options">
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={options.addShot}
                          onChange={(e) => handleOptionChange(menu.id, 'addShot', e.target.checked)}
                        />
                        <span>샷 추가 (+500원)</span>
                      </label>
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={options.addSyrup}
                          onChange={(e) => handleOptionChange(menu.id, 'addSyrup', e.target.checked)}
                        />
                        <span>시럽 추가 (+0원)</span>
                      </label>
                    </div>
                    <button
                      className="add-to-cart-button"
                      onClick={() => addToCart(menu)}
                    >
                      담기
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 장바구니 영역 */}
        <section className="cart-section">
          <h2 className="cart-title">장바구니</h2>
          {cart.length === 0 ? (
            <p className="cart-empty">장바구니가 비어있습니다.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <span className="cart-item-name">
                      {item.menuName}{getOptionText(item.options)} x {item.quantity}
                    </span>
                    <span className="cart-item-price">{formatPrice(item.totalPrice)}원</span>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>총 금액 {formatPrice(calculateTotal())}원</span>
              </div>
              <button
                className="order-button"
                onClick={handleOrder}
              >
                주문하기
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
