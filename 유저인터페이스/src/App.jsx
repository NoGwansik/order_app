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
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  const [menus, setMenus] = useState(initialMenus)
  const [cart, setCart] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})
  const [orders, setOrders] = useState([]) // 주문 목록
  const [orderIdCounter, setOrderIdCounter] = useState(1) // 주문 ID 카운터

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

    // 옵션 선택 초기화
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

    const now = new Date()
    const orderDate = `${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const newOrder = {
      orderId: orderIdCounter,
      orderDate: orderDate,
      orderDateTime: now.toISOString(), // 정렬용
      items: cart.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        quantity: item.quantity,
        price: item.totalPrice / item.quantity,
        options: item.options
      })),
      totalAmount: calculateTotal(),
      status: 'pending' // 'pending' | 'received' | 'in_production' | 'completed'
    }

    setOrderIdCounter(orderIdCounter + 1)
    setOrders([newOrder, ...orders])
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
    if (options?.addShot) parts.push('샷 추가')
    if (options?.addSyrup) parts.push('시럽 추가')
    return parts.length > 0 ? ` (${parts.join(', ')})` : ''
  }

  // 재고 상태 확인
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: '#f44336' }
    if (stock < 5) return { text: '주의', color: '#ff9800' }
    return { text: '정상', color: '#4caf50' }
  }

  // 재고 증가
  const increaseStock = (menuId) => {
    setMenus(menus.map(menu => 
      menu.id === menuId ? { ...menu, stock: menu.stock + 1 } : menu
    ))
  }

  // 재고 감소
  const decreaseStock = (menuId) => {
    setMenus(menus.map(menu => 
      menu.id === menuId && menu.stock > 0 
        ? { ...menu, stock: menu.stock - 1 } 
        : menu
    ))
  }

  // 주문 상태 업데이트
  const updateOrderStatus = (orderId, newStatus) => {
    const order = orders.find(o => o.orderId === orderId)
    if (!order) return

    // 제조 완료 상태로 변경될 때 재고 감소
    if (newStatus === 'completed' && order.status !== 'completed') {
      setMenus(prevMenus => {
        return prevMenus.map(menu => {
          // 주문에 포함된 해당 메뉴 찾기
          const orderItem = order.items.find(item => item.menuId === menu.id)
          if (orderItem) {
            const newStock = Math.max(0, menu.stock - orderItem.quantity)
            return { ...menu, stock: newStock }
          }
          return menu
        })
      })
    }

    setOrders(orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // 대시보드 통계 계산
  const getDashboardStats = () => {
    return {
      totalOrders: orders.length,
      receivedOrders: orders.filter(o => o.status === 'received').length,
      inProductionOrders: orders.filter(o => o.status === 'in_production').length,
      completedOrders: orders.filter(o => o.status === 'completed').length
    }
  }

  const stats = getDashboardStats()

  // 주문하기 화면
  const OrderScreen = () => (
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
  )

  // 관리자 화면
  const AdminScreen = () => (
    <main className="main-content admin-content">
      {/* 관리자 대시보드 */}
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

      {/* 재고 현황 */}
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
                  >
                    -
                  </button>
                  <button 
                    className="stock-button increase"
                    onClick={() => increaseStock(menu.id)}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 주문 현황 */}
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
                  {order.status === 'pending' && (
                    <button
                      className="order-action-button"
                      onClick={() => updateOrderStatus(order.orderId, 'received')}
                    >
                      주문 접수
                    </button>
                  )}
                  {order.status === 'received' && (
                    <button
                      className="order-action-button"
                      onClick={() => updateOrderStatus(order.orderId, 'in_production')}
                    >
                      제조 시작
                    </button>
                  )}
                  {order.status === 'in_production' && (
                    <button
                      className="order-action-button"
                      onClick={() => updateOrderStatus(order.orderId, 'completed')}
                    >
                      제조 완료
                    </button>
                  )}
                  {order.status === 'completed' && (
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
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          <h1 className="brand">COZY</h1>
          <nav className="nav-buttons">
            <button 
              className={`nav-button ${currentView === 'order' ? 'active' : ''}`}
              onClick={() => setCurrentView('order')}
            >
              주문하기
            </button>
            <button 
              className={`nav-button ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
            >
              관리자
            </button>
          </nav>
        </div>
      </header>

      {/* 화면 전환 */}
      {currentView === 'order' ? <OrderScreen /> : <AdminScreen />}
    </div>
  )
}

export default App
