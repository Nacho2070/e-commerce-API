import express from 'express';
const router = express.Router();

import {
	listUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	addAddress,
	removeAddress
} from '../controller/userController.js';

router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Address management
router.post('/:id/addresses', addAddress);
router.delete('/:id/addresses/:index', removeAddress);

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