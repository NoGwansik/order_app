import pool from '../config/database.js'

// 주문 생성
export const createOrder = async (req, res) => {
  const client = await pool.connect()
  
  try {
    const { items, totalAmount } = req.body

    // 입력 검증
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '주문 항목이 필요합니다.'
      })
    }

    if (!totalAmount || typeof totalAmount !== 'number') {
      return res.status(400).json({
        success: false,
        error: '총 금액이 필요합니다.'
      })
    }

    // 트랜잭션 시작
    await client.query('BEGIN')

    // 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (order_date, status, total_amount) 
       VALUES (CURRENT_TIMESTAMP, 'pending', $1) 
       RETURNING id, order_date, status, total_amount`,
      [totalAmount]
    )

    const order = orderResult.rows[0]

    // 주문 상세 항목 삽입
    const orderItems = []
    for (const item of items) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, unit_price, options) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, menu_id, quantity, unit_price, options`,
        [
          order.id,
          item.menuId,
          item.quantity,
          item.price,
          JSON.stringify(item.options || {})
        ]
      )
      orderItems.push(itemResult.rows[0])
    }

    // 트랜잭션 커밋
    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.total_amount
      }
    })
  } catch (error) {
    // 트랜잭션 롤백
    await client.query('ROLLBACK')
    console.error('주문 생성 오류:', error)
    res.status(500).json({
      success: false,
      error: '주문 생성 중 오류가 발생했습니다.'
    })
  } finally {
    client.release()
  }
}

// 주문 목록 조회
export const getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        o.id,
        o.order_date,
        o.status,
        o.total_amount,
        o.created_at
       FROM orders o
       ORDER BY o.order_date DESC`
    )

    // 각 주문의 상세 항목 조회
    const orders = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT 
            oi.id,
            oi.menu_id as "menuId",
            m.name as "menuName",
            oi.quantity,
            oi.unit_price as "unitPrice",
            oi.options
           FROM order_items oi
           JOIN menus m ON oi.menu_id = m.id
           WHERE oi.order_id = $1`,
          [order.id]
        )

        return {
          id: order.id,
          orderDate: order.order_date,
          status: order.status,
          totalAmount: order.total_amount,
          items: itemsResult.rows.map(item => ({
            menuId: item.menuId,
            menuName: item.menuName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            options: typeof item.options === 'string' 
              ? JSON.parse(item.options) 
              : item.options
          }))
        }
      })
    )

    res.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '주문 목록 조회 중 오류가 발생했습니다.'
    })
  }
}

// 주문 정보 조회
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params

    // 주문 정보 조회
    const orderResult = await pool.query(
      `SELECT id, order_date, status, total_amount 
       FROM orders 
       WHERE id = $1`,
      [orderId]
    )

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      })
    }

    const order = orderResult.rows[0]

    // 주문 상세 항목 조회
    const itemsResult = await pool.query(
      `SELECT 
        oi.id,
        oi.menu_id as "menuId",
        m.name as "menuName",
        oi.quantity,
        oi.unit_price as "unitPrice",
        oi.options
       FROM order_items oi
       JOIN menus m ON oi.menu_id = m.id
       WHERE oi.order_id = $1`,
      [orderId]
    )

    res.json({
      success: true,
      data: {
        id: order.id,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.total_amount,
        items: itemsResult.rows.map(item => ({
          id: item.id,
          menuId: item.menuId,
          menuName: item.menuName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          options: typeof item.options === 'string' 
            ? JSON.parse(item.options) 
            : item.options
        }))
      }
    })
  } catch (error) {
    console.error('주문 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '주문 조회 중 오류가 발생했습니다.'
    })
  }
}

// 주문 상태 업데이트
export const updateOrderStatus = async (req, res) => {
  const client = await pool.connect()
  
  try {
    const { orderId } = req.params
    const { status } = req.body

    // 유효한 상태 값 확인
    const validStatuses = ['received', 'in_production', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 주문 상태입니다.'
      })
    }

    // 트랜잭션 시작
    await client.query('BEGIN')

    // 현재 주문 정보 조회
    const orderResult = await client.query(
      'SELECT status FROM orders WHERE id = $1',
      [orderId]
    )

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      })
    }

    const currentStatus = orderResult.rows[0].status

    // 제조 완료 상태로 변경될 때 재고 감소
    if (status === 'completed' && currentStatus !== 'completed') {
      // 주문에 포함된 메뉴별 수량 합산
      const itemsResult = await client.query(
        `SELECT menu_id, SUM(quantity) as total_quantity
         FROM order_items
         WHERE order_id = $1
         GROUP BY menu_id`,
        [orderId]
      )

      // 각 메뉴의 재고 감소
      for (const item of itemsResult.rows) {
        await client.query(
          `UPDATE menus 
           SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2 AND stock >= $1`,
          [item.total_quantity, item.menu_id]
        )

        // 재고 부족 확인
        const stockCheck = await client.query(
          'SELECT stock FROM menus WHERE id = $1',
          [item.menu_id]
        )

        if (stockCheck.rows[0].stock < 0) {
          await client.query('ROLLBACK')
          return res.status(400).json({
            success: false,
            error: '재고가 부족합니다.'
          })
        }
      }
    }

    // 주문 상태 업데이트
    const updateResult = await client.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, status`,
      [status, orderId]
    )

    // 트랜잭션 커밋
    await client.query('COMMIT')

    res.json({
      success: true,
      data: {
        orderId: parseInt(orderId),
        status: updateResult.rows[0].status
      }
    })
  } catch (error) {
    // 트랜잭션 롤백
    await client.query('ROLLBACK')
    console.error('주문 상태 업데이트 오류:', error)
    res.status(500).json({
      success: false,
      error: '주문 상태 업데이트 중 오류가 발생했습니다.'
    })
  } finally {
    client.release()
  }
}

