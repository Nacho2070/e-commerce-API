import express from 'express';
const router = express.Router();
import { requireAdmin, validateToken } from '../services/auth.service.js';

import {
	listUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	addAddress,
	removeAddress,
  login
} from '../controller/userController.js';

router.post('/login', login);
router.post('/register', createUser);

// Address management
router.post('/:id/addresses',validateToken,addAddress);
router.delete('/:id/addresses/:index',validateToken, removeAddress);

// Admin routes
router.get('/',validateToken, requireAdmin, listUsers);
router.get('/:id',validateToken, requireAdmin, getUser);  
router.put('/:id',validateToken, requireAdmin, updateUser);
router.delete('/:id',validateToken,requireAdmin, deleteUser);

export default router;
/*
import express from "express";
import { validateToken, requireAdmin } from "../services/auth.service.js";
import {
  createUsuario,
  readUsuario,
  updateUsuario,
  deleteUsuario,
  login,
} from "../controllers/usuarioController.js";

export const usuarioRoutes = express.Router();

usuarioRoutes
  .post("/crear", createUsuario)
  .get("/listar",validateToken,requireAdmin, readUsuario)
  .put("/actualizar/:id", validateToken,requireAdmin, updateUsuario)
  .delete("/eliminar/:id", validateToken, requireAdmin, deleteUsuario)
  .post("/login", login);

*/