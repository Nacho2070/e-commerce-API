import express from 'express';
const router = express.Router();

import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory
} from '../controller/categoryController.js';

router.get('/', listCategories);
router.post('/', createCategory);
router.get('/:id', getCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

// Productos en una categoría
router.get('/:id/products', getProductsByCategory);

export default router;
