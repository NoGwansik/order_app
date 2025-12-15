import pool from './database.js'

const viewData = async () => {
  const client = await pool.connect()
  
  try {
    console.log('\n=== 메뉴 데이터 ===')
    const menus = await client.query('SELECT * FROM menus ORDER BY id')
    if (menus.rows.length > 0) {
      console.table(menus.rows)
    } else {
      console.log('메뉴 데이터가 없습니다.')
    }
    
    console.log('\n=== 옵션 데이터 ===')
    const options = await client.query('SELECT * FROM options ORDER BY id')
    if (options.rows.length > 0) {
      console.table(options.rows)
    } else {
      console.log('옵션 데이터가 없습니다.')
    }
    
    console.log('\n=== 주문 데이터 (최근 10개) ===')
    const orders = await client.query(`
      SELECT id, order_date, status, total_amount, created_at 
      FROM orders 
      ORDER BY order_date DESC 
      LIMIT 10
    `)
    if (orders.rows.length > 0) {
      console.table(orders.rows)
    } else {
      console.log('주문 데이터가 없습니다.')
    }
    
    console.log('\n=== 주문 상세 데이터 (최근 10개) ===')
    const orderItems = await client.query(`
      SELECT 
        oi.id,
        oi.order_id,
        oi.menu_id,
        m.name as menu_name,
        oi.quantity,
        oi.unit_price,
        oi.options,
        oi.created_at
      FROM order_items oi 
      JOIN menus m ON oi.menu_id = m.id 
      ORDER BY oi.created_at DESC 
      LIMIT 10
    `)
    if (orderItems.rows.length > 0) {
      console.table(orderItems.rows)
    } else {
      console.log('주문 상세 데이터가 없습니다.')
    }
    
    // 통계 정보
    console.log('\n=== 통계 정보 ===')
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM menus) as total_menus,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM order_items) as total_order_items,
        (SELECT SUM(total_amount) FROM orders) as total_revenue,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'received') as received_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'in_production') as in_production_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'completed') as completed_orders
    `)
    console.table(stats.rows)
    
  } catch (error) {
    console.error('데이터 조회 오류:', error.message)
    console.error(error)
  } finally {
    client.release()
    await pool.end()
    process.exit(0)
  }
}

viewData()

