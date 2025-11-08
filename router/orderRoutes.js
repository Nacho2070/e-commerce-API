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
import { validateToken, requireAdmin  } from '../services/auth.service.js';

// Listar pedidos con datos de usuario
router.get('/',validateToken, requireAdmin, listOrders);

// Estadísticas: total de pedidos por estado
router.get('/stats',validateToken,requireAdmin, orderStats);

// Pedidos de un usuario
router.get('/user/:userId',validateToken, getOrdersByUser);

// CRUD estándar
router.post('/', validateToken, createOrder);
router.get('/:id',validateToken, getOrder);
router.put('/:id',validateToken,requireAdmin, updateOrder);
router.delete('/:id',validateToken,requireAdmin, deleteOrder);

// Actualizar estado (PATCH /:id/status)
router.patch('/:id/status',validateToken,requireAdmin, updateOrderStatus);


export default router;