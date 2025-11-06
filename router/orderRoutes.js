import express from 'express';
const router = express.Router();

import {
 createOrder,
  listOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  orderStats,
  updateOrderStatus,
  getOrdersByUser
} from '../controller/orderController.js';

// Listar pedidos con datos de usuario
router.get('/', listOrders);

// Estadísticas: total de pedidos por estado
router.get('/stats', orderStats);

// Pedidos de un usuario
router.get('/user/:userId', getOrdersByUser);

// CRUD estándar
router.post('/', createOrder);
router.get('/:id', getOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

// Actualizar estado (PATCH /:id/status)
router.patch('/:id/status', updateOrderStatus);


export default router;