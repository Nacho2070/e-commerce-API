import express from "express";
import {
  obtenerCarrito,
  agregarOActualizarItem,
  eliminarItem,
  vaciarCarrito,
  calcularTotalCarrito,
} from "../controller/cartController.js";
import { validateToken } from "../services/auth.service.js";

export const carritoRoutes = express.Router();

carritoRoutes.route("/vaciar/:userId").delete(validateToken, vaciarCarrito);

carritoRoutes.route("/:userId/:productoId").delete(validateToken, eliminarItem);

carritoRoutes.route("/:userId/total").get(validateToken,calcularTotalCarrito);

carritoRoutes
  .route("/:userId")
  .get(validateToken, obtenerCarrito)
  .post(validateToken, agregarOActualizarItem);

export default carritoRoutes;