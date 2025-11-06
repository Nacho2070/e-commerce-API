import { Carrito } from '../models/CartModel.js';
//import { Product } from '../models/Product.js';

export const obtenerCarrito = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;

        let carrito = await Carrito.findOne({ usuario: userId })
            .populate('items.producto', 'nombre precio stock');

        if (!carrito) {
            carrito = await Carrito.create({ usuario: userId, items: [] });
            return res.status(201).json(carrito);
        }

        return res.status(200).json(carrito);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de usuario no válido', details: err.message });
        }
        return res.status(500).json({ error: 'Error al obtener el carrito', details: err.message });
    }
}

export const agregarOActualizarItem = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        const { producto: productoId, cantidad } = req.body;

        if (!productoId || !cantidad || cantidad < 1) {
            return res.status(400).json({ error: 'Faltan datos de producto o la cantidad es inválida' });
        }

        const carrito = await Carrito.findOne({ usuario: userId });

        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado para este usuario' });
        }

        const itemIndex = carrito.items.findIndex(
            item => item.producto.toString() === productoId
        );

        if (itemIndex > -1) {
            carrito.items[itemIndex].cantidad = cantidad;
        } else {
            carrito.items.push({ producto: productoId, cantidad });
        }

        const carritoActualizado = await carrito.save();
        return res.status(200).json(carritoActualizado);

    } catch (err) {
        if (err.name === 'CastError' || err.name === 'ValidationError') {
            return res.status(400).json({ error: 'Datos de producto o ID no válidos', details: err.message });
        }
        return res.status(500).json({ error: 'Error al agregar ítem al carrito', details: err.message });
    }
}

export const eliminarItem = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        const { productoId } = req.params;

        const carrito = await Carrito.findOne({ usuario: userId });

        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const itemIndex = carrito.items.findIndex(
            item => item.producto.toString() === productoId
        );

        if (itemIndex > -1) {
            carrito.items.splice(itemIndex, 1);
            const carritoActualizado = await carrito.save();
            return res.status(200).json(carritoActualizado);
        } else {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de producto no válido', details: err.message });
        }
        return res.status(500).json({ error: 'Error al eliminar ítem del carrito', details: err.message });
    }
}

export const vaciarCarrito = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;

        const carrito = await Carrito.findOne({ usuario: userId });

        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        carrito.items = [];
        const carritoVacio = await carrito.save();

        return res.status(200).json(carritoVacio);

    } catch (err) {
        return res.status(500).json({ error: 'Error al vaciar el carrito', details: err.message });
    }
}

//Calcular total y subtotal
export const calcularTotalCarrito = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;

        const carrito = await Carrito.findOne({ usuario: userId })
            .populate("items.producto", "name price");

        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        let total = 0;
        const itemsConSubtotal = carrito.items.map(item => {
            const subtotal = item.cantidad * item.producto.price;
            total += subtotal;
            return {
                producto: item.producto.name,
                cantidad: item.cantidad,
                precioUnitario: item.producto.price,
                subtotal
            };
        });

        return res.status(200).json({
            usuario: userId,
            items: itemsConSubtotal,
            total
        });

    } catch (err) {
        return res.status(500).json({ error: "Error al calcular total del carrito", details: err.message });
    }
};
