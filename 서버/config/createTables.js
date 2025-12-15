import pool, { testConnection } from './database.js'

// 테이블 생성 스크립트
const createTables = async () => {
  const client = await pool.connect()
  
  try {
    console.log('테이블 생성을 시작합니다...')

    // 1. Menus 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image_url VARCHAR(500),
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ menus 테이블 생성 완료')

    // 2. Options 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        menu_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_menu
          FOREIGN KEY (menu_id)
          REFERENCES menus(id)
          ON DELETE SET NULL
      )
    `)
    console.log('✓ options 테이블 생성 완료')

    // 3. Orders 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        total_amount INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_status
          CHECK (status IN ('pending', 'received', 'in_production', 'completed'))
      )
    `)
    console.log('✓ orders 테이블 생성 완료')

    // 4. OrderItems 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        menu_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        options JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_order
          FOREIGN KEY (order_id)
          REFERENCES orders(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_menu
          FOREIGN KEY (menu_id)
          REFERENCES menus(id)
          ON DELETE CASCADE
      )
    `)
    console.log('✓ order_items 테이블 생성 완료')

    // 인덱스 생성 (성능 최적화)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_menu_id ON order_items(menu_id)
    `)
    console.log('✓ 인덱스 생성 완료')

    console.log('\n모든 테이블이 성공적으로 생성되었습니다!')
  } catch (error) {
    console.error('테이블 생성 오류:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// 초기 데이터 삽입
const insertInitialData = async () => {
  const client = await pool.connect()
  
  try {
    console.log('\n초기 데이터 삽입을 시작합니다...')

    // 메뉴 데이터 확인 및 삽입
    const menuCheck = await client.query('SELECT COUNT(*) FROM menus')
    if (parseInt(menuCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO menus (name, description, price, image_url, stock) VALUES
        ('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, '', 10),
        ('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, '', 10),
        ('카페라떼', '부드러운 카페라떼', 5000, '', 10)
      `)
      console.log('✓ 초기 메뉴 데이터 삽입 완료')
    } else {
      console.log('✓ 메뉴 데이터가 이미 존재합니다.')
    }

    // 옵션 데이터 확인 및 삽입
    const optionCheck = await client.query('SELECT COUNT(*) FROM options')
    if (parseInt(optionCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO options (name, price, menu_id) VALUES
        ('샷 추가', 500, NULL),
        ('시럽 추가', 0, NULL)
      `)
      console.log('✓ 초기 옵션 데이터 삽입 완료')
    } else {
      console.log('✓ 옵션 데이터가 이미 존재합니다.')
    }

    console.log('\n초기 데이터 삽입이 완료되었습니다!')
  } catch (error) {
    console.error('초기 데이터 삽입 오류:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// 메인 실행 함수
const main = async () => {
  try {
    // 먼저 연결 테스트
    console.log('데이터베이스 연결을 테스트합니다...')
    const connected = await testConnection()
    if (!connected) {
      console.error('데이터베이스 연결에 실패했습니다.')
      process.exit(1)
    }
    
    await createTables()
    await insertInitialData()
    console.log('\n✅ 모든 작업이 완료되었습니다!')
    await pool.end() // 연결 풀 종료
    process.exit(0)
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    await pool.end().catch(() => {}) // 에러 발생 시에도 연결 풀 종료 시도
    process.exit(1)
  }
}

main()

