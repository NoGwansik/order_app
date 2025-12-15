import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js'

const router = express.Router()

// GET /api/orders - 주문 목록 조회
router.get('/', getOrders)

// GET /api/orders/:orderId - 주문 정보 조회
router.get('/:orderId', getOrderById)

// POST /api/orders - 주문 생성
router.post('/', createOrder)

// PATCH /api/orders/:orderId/status - 주문 상태 업데이트
router.patch('/:orderId/status', updateOrderStatus)

export default router

