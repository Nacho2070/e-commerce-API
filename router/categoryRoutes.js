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
import { validateToken,requireAdmin } from '../services/auth.service.js';

router.get('/', validateToken, listCategories);
router.post('/',validateToken, requireAdmin,createCategory);

router.get('/estadisticas',validateToken, getProductsByCategory);

router.get('/:id',validateToken, requireAdmin,getCategory);
router.put('/:id', validateToken, requireAdmin,updateCategory);
router.delete('/:id',validateToken, requireAdmin, deleteCategory);


export default router;
