import express from 'express';
const router = express.Router();

import {
    crearResena,
    listarResenasPorProducto,
    obtenerResena,
    actualizarResena,
    eliminarResena,
    promedioCalificacionesPorProducto,
    allResenas
} from '../controller/reviewController.js';
import { requireAdmin, validateToken } from '../services/auth.service.js';

// Reseñas de un producto
router.get('/product/:productId', listarResenasPorProducto);

// Top: promedio de calificaciones por producto
router.get('/top', promedioCalificacionesPorProducto);

// CRUD de reseñas
router.post('/',validateToken, crearResena);
router.get('/', allResenas);
router.get('/:id', obtenerResena);
router.put('/:id',validateToken,requireAdmin, actualizarResena);
router.delete('/:id',validateToken, eliminarResena);

export default router;