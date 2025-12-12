import pool from '../config/database.js'

// 메뉴 목록 조회
export const getMenus = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, price, image_url as "imageUrl", stock FROM menus ORDER BY id'
    )
    
    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('메뉴 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.'
    })
  }
}

// 재고 업데이트
export const updateStock = async (req, res) => {
  try {
    const { menuId } = req.params
    const { change } = req.body

    if (!change || (change !== 1 && change !== -1)) {
      return res.status(400).json({
        success: false,
        error: 'change 값은 1 또는 -1이어야 합니다.'
      })
    }

    // 현재 재고 확인
    const currentStock = await pool.query(
      'SELECT stock FROM menus WHERE id = $1',
      [menuId]
    )

    if (currentStock.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.'
      })
    }

    const newStock = currentStock.rows[0].stock + change

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: '재고가 부족합니다.'
      })
    }

    // 재고 업데이트
    const result = await pool.query(
      'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, stock',
      [newStock, menuId]
    )

    res.json({
      success: true,
      data: {
        menuId: parseInt(menuId),
        stock: result.rows[0].stock
      }
    })
  } catch (error) {
    console.error('재고 업데이트 오류:', error)
    res.status(500).json({
      success: false,
      error: '재고 업데이트 중 오류가 발생했습니다.'
    })
  }
}

