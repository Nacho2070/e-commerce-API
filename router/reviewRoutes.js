import express from 'express';
const router = express.Router();

import {
    crearResena,
    listarResenasPorProducto,
    obtenerResena,
    actualizarResena,
    eliminarResena,
    promedioCalificacionesPorProducto
} from '../controller/reviewController.js';

// Reseñas de un producto
router.get('/product/:productId', listarResenasPorProducto);

// Top: promedio de calificaciones por producto
router.get('/top', promedioCalificacionesPorProducto);

// CRUD de reseñas
router.post('/', crearResena);
router.get('/', async (req, res) => {
    // listing all handled in controller via dynamic import earlier or via model; keep simple here
    const { Resena } = await import('../models/ReviewModel.js');
    const resenas = await Resena.find().populate('usuario', 'nombre email').populate('producto', 'nombre');
    res.status(200).json({ success: true, data: resenas });
});
router.get('/:id', obtenerResena);
router.put('/:id', actualizarResena);
router.delete('/:id', eliminarResena);

export default router;