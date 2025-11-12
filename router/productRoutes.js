import express from "express";
const router = express.Router();

import {
	listProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	filterProducts,
	topProducts,
	updateStock
} from "../controller/productController.js";
import { requireAdmin, validateToken } from "../services/auth.service.js";

// Listar productos con categoría
router.get('/', listProducts);

// Filtrar por precio y marca
router.get('/filtro', filterProducts);

// Top productos más reseñados
router.get('/top', topProducts);

// Obtener, actualizar o borrar por id
router.get('/:id', getProduct);
router.post('/', validateToken, requireAdmin, createProduct);
router.put('/:id',validateToken, requireAdmin, updateProduct);
router.delete('/:id',validateToken, requireAdmin, deleteProduct);

// Actualizar stock
router.patch('/:id/stock',validateToken, requireAdmin, updateStock);

export default router;