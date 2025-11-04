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

// Listar productos con categoría
router.get('/', listProducts);

// Filtrar por precio y marca -> /filtro
router.get('/filtro', filterProducts);

// Top productos más reseñados
router.get('/top', topProducts);

// Obtener, actualizar o borrar por id
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Actualizar stock (PATCH /:id/stock)
router.patch('/:id/stock', updateStock);

export default router;