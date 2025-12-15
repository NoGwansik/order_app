import { useState, useMemo, useCallback } from 'react'
import './App.css'

// 상수 정의
const OPTION_PRICES = {
  SHOT: 500,
  SYRUP: 0
}

const STOCK_THRESHOLDS = {
  LOW_STOCK: 5,
  OUT_OF_STOCK: 0
}

const ORDER_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  IN_PRODUCTION: 'in_production',
  COMPLETED: 'completed'
}

const VIEWS = {
  ORDER: 'order',
  ADMIN: 'admin'
}

// 임시 메뉴 데이터
const initialMenus = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원한 아이스 아메리카노',
    imageUrl: '/images/americano-ice.jpg', // public/images 폴더에 이미지 파일을 넣으세요
    temperature: 'ICE',
    stock: 10
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻한 핫 아메리카노',
    imageUrl: '/images/americano-hot.jpg', // public/images 폴더에 이미지 파일을 넣으세요
    temperature: 'HOT',
    stock: 10
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 카페라떼',
    imageUrl: '/images/cafe-latte.jpg', // public/images 폴더에 이미지 파일을 넣으세요
    temperature: 'HOT',
    stock: 10
  }
]

// 유틸리티 함수들
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const getOptionText = (options) => {
  const parts = []
  if (options?.addShot) parts.push('샷 추가')
  if (options?.addSyrup) parts.push('시럽 추가')
  return parts.length > 0 ? ` (${parts.join(', ')})` : ''
}

const calculateOptionPrice = (options) => {
  return (options.addShot ? OPTION_PRICES.SHOT : 0) + (options.addSyrup ? OPTION_PRICES.SYRUP : 0)
}

const getStockStatus = (stock) => {
  if (stock === STOCK_THRESHOLDS.OUT_OF_STOCK) return { text: '품절', color: '#f44336' }
  if (stock < STOCK_THRESHOLDS.LOW_STOCK) return { text: '주의', color: '#ff9800' }
  return { text: '정상', color: '#4caf50' }
}

const formatOrderDate = (date) => {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// API URL 설정 (환경 변수 또는 기본값)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.ORDER)
  const [menus, setMenus] = useState(initialMenus)
  const [cart, setCart] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})
  const [orders, setOrders] = useState([])
  const [orderIdCounter, setOrderIdCounter] = useState(1)

  // 옵션 선택 핸들러
  const handleOptionChange = useCallback((menuId, option, checked) => {
    setSelectedOptions(prev => ({
      ...prev,
      [menuId]: {
        addShot: prev[menuId]?.addShot || false,
        addSyrup: prev[menuId]?.addSyrup || false,
        [option]: checked
      }
    }))
  }, [])

  // 장바구니에 추가
  const addToCart = useCallback((menu) => {
    // 재고 확인
    if (menu.stock === 0) {
      alert(`${menu.name}은(는) 품절되었습니다.`)
      return
    }

    const options = {
      addShot: selectedOptions[menu.id]?.addShot || false,
      addSyrup: selectedOptions[menu.id]?.addSyrup || false
    }
    
    const optionPrice = calculateOptionPrice(options)
    const unitPrice = menu.price + optionPrice

    // 장바구니에서 동일한 메뉴와 옵션 조합 찾기
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
      setCart(prevCart => prevCart.map((item, idx) => {
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
      setCart(prevCart => [...prevCart, newItem])
    }

    // 옵션 선택 초기화
    setSelectedOptions(prev => ({
      ...prev,
      [menu.id]: { addShot: false, addSyrup: false }
    }))
  }, [cart, selectedOptions])

  // 총 금액 계산 (메모이제이션)
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }, [cart])

  // 주문하기
  const handleOrder = useCallback(() => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    // 재고 확인
    const insufficientStock = cart.some(item => {
      const menu = menus.find(m => m.id === item.menuId)
      return menu && menu.stock < item.quantity
    })

    if (insufficientStock) {
      alert('재고가 부족한 메뉴가 있습니다. 장바구니를 확인해주세요.')
      return
    }

    const now = new Date()
    const newOrder = {
      orderId: orderIdCounter,
      orderDate: formatOrderDate(now),
      orderDateTime: now.toISOString(),
      items: cart.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        quantity: item.quantity,
        price: item.totalPrice / item.quantity,
        options: item.options
      })),
      totalAmount: totalAmount,
      status: ORDER_STATUS.PENDING
    }

    setOrderIdCounter(prev => prev + 1)
    setOrders(prev => [newOrder, ...prev])
    alert(`주문이 완료되었습니다!\n총 금액: ${formatPrice(totalAmount)}원`)
    setCart([])
  }, [cart, menus, orderIdCounter, totalAmount])

  // 재고 증가
  const increaseStock = useCallback((menuId) => {
    setMenus(prevMenus => prevMenus.map(menu => 
      menu.id === menuId ? { ...menu, stock: menu.stock + 1 } : menu
    ))
  }, [])

  // 재고 감소
  const decreaseStock = useCallback((menuId) => {
    setMenus(prevMenus => prevMenus.map(menu => 
      menu.id === menuId && menu.stock > 0 
        ? { ...menu, stock: menu.stock - 1 } 
        : menu
    ))
  }, [])

  // 주문 상태 업데이트
  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders(prevOrders => {
      const order = prevOrders.find(o => o.orderId === orderId)
      if (!order) return prevOrders

      // 제조 완료 상태로 변경될 때 재고 감소
      if (newStatus === ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.COMPLETED) {
        setMenus(prevMenus => {
          return prevMenus.map(menu => {
            // 같은 메뉴가 여러 번 주문되었을 수 있으므로 모든 항목을 찾아 수량 합산
            const orderItems = order.items.filter(item => item.menuId === menu.id)
            if (orderItems.length > 0) {
              const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0)
              const newStock = Math.max(0, menu.stock - totalQuantity)
              return { ...menu, stock: newStock }
            }
            return menu
          })
        })
      }

      return prevOrders.map(order => 
        order.orderId === orderId ? { ...order, status: newStatus } : order
      )
    })
  }, [])

  // 대시보드 통계 계산 (메모이제이션)
  const stats = useMemo(() => {
    return {
      totalOrders: orders.length,
      receivedOrders: orders.filter(o => o.status === ORDER_STATUS.RECEIVED).length,
      inProductionOrders: orders.filter(o => o.status === ORDER_STATUS.IN_PRODUCTION).length,
      completedOrders: orders.filter(o => o.status === ORDER_STATUS.COMPLETED).length
    }
  }, [orders])

  // 주문하기 화면
  const OrderScreen = () => (
    <main className="main-content">
      <section className="menu-section">
        <div className="menu-grid">
          {menus.map(menu => {
            const options = selectedOptions[menu.id] || { addShot: false, addSyrup: false }
            const optionPrice = calculateOptionPrice(options)
            const displayPrice = menu.price + optionPrice

            return (
              <div key={menu.id} className="menu-card">
                <div className="menu-image">
                  {menu.imageUrl ? (
                    <img 
                      src={menu.imageUrl} 
                      alt={menu.name}
                      onError={(e) => {
                        // 이미지 로드 실패 시 플레이스홀더 표시
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="image-placeholder" style={{ display: menu.imageUrl ? 'none' : 'flex' }}>
                    {menu.imageUrl ? '' : '이미지'}
                  </div>
                </div>
                <div className="menu-info">
                  <h3 className="menu-name">{menu.name}</h3>
                  <p className="menu-price">{formatPrice(displayPrice)}원</p>
                  <p className="menu-description">{menu.description}</p>
                  {menu.stock === 0 && (
                    <p className="menu-out-of-stock">품절</p>
                  )}
                  <div className="menu-options">
                    <label className="option-label">
                      <input
                        type="checkbox"
                        checked={options.addShot}
                        onChange={(e) => handleOptionChange(menu.id, 'addShot', e.target.checked)}
                        disabled={menu.stock === 0}
                        aria-label="샷 추가 옵션"
                      />
                      <span>샷 추가 (+{formatPrice(OPTION_PRICES.SHOT)}원)</span>
                    </label>
                    <label className="option-label">
                      <input
                        type="checkbox"
                        checked={options.addSyrup}
                        onChange={(e) => handleOptionChange(menu.id, 'addSyrup', e.target.checked)}
                        disabled={menu.stock === 0}
                        aria-label="시럽 추가 옵션"
                      />
                      <span>시럽 추가 (+{formatPrice(OPTION_PRICES.SYRUP)}원)</span>
                    </label>
                  </div>
                  <button
                    className="add-to-cart-button"
                    onClick={() => addToCart(menu)}
                    disabled={menu.stock === 0}
                    aria-label={`${menu.name} 장바구니에 추가`}
                  >
                    {menu.stock === 0 ? '품절' : '담기'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="cart-section">
        <h2 className="cart-title">장바구니</h2>
        {cart.length === 0 ? (
          <p className="cart-empty">장바구니가 비어있습니다.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={`${item.menuId}-${item.options.addShot}-${item.options.addSyrup}-${index}`} className="cart-item">
                  <span className="cart-item-name">
                    {item.menuName}{getOptionText(item.options)} x {item.quantity}
                  </span>
                  <span className="cart-item-price">{formatPrice(item.totalPrice)}원</span>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span>총 금액 {formatPrice(totalAmount)}원</span>
            </div>
            <button
              className="order-button"
              onClick={handleOrder}
              aria-label="주문하기"
            >
              주문하기
            </button>
          </>
        )}
      </section>
    </main>
  )

  // 관리자 화면
  const AdminScreen = () => (
    <main className="main-content admin-content">
      <section className="dashboard-section">
        <h2 className="section-title">관리자 대시보드</h2>
        <div className="dashboard-stats">
          <span>총 주문 {stats.totalOrders}</span>
          <span>/</span>
          <span>주문 접수 {stats.receivedOrders}</span>
          <span>/</span>
          <span>제조 중 {stats.inProductionOrders}</span>
          <span>/</span>
          <span>제조 완료 {stats.completedOrders}</span>
        </div>
      </section>

      <section className="inventory-section">
        <h2 className="section-title">재고 현황</h2>
        <div className="inventory-list">
          {menus.map(menu => {
            const stockStatus = getStockStatus(menu.stock)
            return (
              <div key={menu.id} className="inventory-item">
                <div className="inventory-info">
                  <span className="inventory-name">{menu.name}</span>
                  <div className="inventory-stock">
                    <span className="stock-quantity">{menu.stock}개</span>
                    <span className="stock-status" style={{ color: stockStatus.color }}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>
                <div className="inventory-controls">
                  <button 
                    className="stock-button decrease"
                    onClick={() => decreaseStock(menu.id)}
                    disabled={menu.stock === 0}
                    aria-label={`${menu.name} 재고 감소`}
                  >
                    -
                  </button>
                  <button 
                    className="stock-button increase"
                    onClick={() => increaseStock(menu.id)}
                    aria-label={`${menu.name} 재고 증가`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="orders-section">
        <h2 className="section-title">주문 현황</h2>
        {orders.length === 0 ? (
          <p className="orders-empty">주문이 없습니다.</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.orderId} className="order-item">
                <div className="order-info">
                  <div className="order-header">
                    <span className="order-date">{order.orderDate}</span>
                    <span className="order-amount">{formatPrice(order.totalAmount)}원</span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="order-item-name">
                        {item.menuName}{getOptionText(item.options)} x {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="order-actions">
                  {order.status === ORDER_STATUS.PENDING && (
                    <button
                      className="order-action-button"
                      onClick={() => updateOrderStatus(order.orderId, ORDER_STATUS.RECEIVED)}
                      aria-label="주문 접수"
                    >
                      주문 접수
                    </button>
                  )}
                  {order.status === ORDER_STATUS.RECEIVED && (
                    <button
                      className="order-action-button"
                      onClick={() => updateOrderStatus(order.orderId, ORDER_STATUS.IN_PRODUCTION)}
                      aria-label="제조 시작"
                    >
                      제조 시작
                    </button>
                  )}
                  {order.status === ORDER_STATUS.IN_PRODUCTION && (
                    <button
                      className="order-action-button"
                      onClick={() => updateOrderStatus(order.orderId, ORDER_STATUS.COMPLETED)}
                      aria-label="제조 완료"
                    >
                      제조 완료
                    </button>
                  )}
                  {order.status === ORDER_STATUS.COMPLETED && (
                    <span className="order-completed">완료</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <h1 className="brand">COZY</h1>
          <nav className="nav-buttons">
            <button 
              className={`nav-button ${currentView === VIEWS.ORDER ? 'active' : ''}`}
              onClick={() => setCurrentView(VIEWS.ORDER)}
              aria-label="주문하기 화면으로 이동"
            >
              주문하기
            </button>
            <button 
              className={`nav-button ${currentView === VIEWS.ADMIN ? 'active' : ''}`}
              onClick={() => setCurrentView(VIEWS.ADMIN)}
              aria-label="관리자 화면으로 이동"
            >
              관리자
            </button>
          </nav>
        </div>
      </header>

      {currentView === VIEWS.ORDER ? <OrderScreen /> : <AdminScreen />}
    </div>
  )
}

export default App
