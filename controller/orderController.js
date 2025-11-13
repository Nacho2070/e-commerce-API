import { Pedido } from '../models/OrderModel.js'; 
import Product from '../models/Product.js';

export const createOrder = async (req, res) => {
    try {
    const { usuario, items, metodoPago } = req.body;

    if (!usuario || !items?.length || !metodoPago) {
      return res.status(400).json({ error: "Faltan datos del pedido" });
    }

    let total = 0;
    const itemsConSubtotal = [];

    for (const item of items) {
      const producto = await Product.findById(item.producto);
      if (!producto) {
        return res.status(404).json({ error: `Producto con ID ${item.producto} no encontrado` });
      }
      
      const price = Number(producto.price ?? producto.precio);
      const quantity = Number(item.cantidad ?? item.quantity);
      console.log(price, quantity);

      if (!isFinite(price) || !isFinite(quantity)) {
        return res.status(400).json({ error: `Precio o cantidad inválida para el producto ${item.producto}` });
      }

      const subtotal = Number((price * quantity).toFixed(2));
      total += subtotal;

      itemsConSubtotal.push({
        producto: producto._id,
        cantidad: item.cantidad,
        subtotal,
      });
    }

    const nuevoPedido = new Pedido({
      usuario,
      items: itemsConSubtotal,
      total,
      metodoPago,
      estado: "pendiente",
    });

    await nuevoPedido.save();

    return res.status(201).json(nuevoPedido);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos del pedido incompletos o inválidos",
        details: err.message,
      });
    }
    return res.status(500).json({
      error: "Error al crear el pedido",
      details: err.message,
    });
  }
};

export const listOrders = async (req, res) => {
    try {
        const pedidos = await Pedido.find()
            .populate('usuario', 'nombre email') 
            .populate('items.producto', 'nombre precio');
        
        return res.status(200).json(pedidos);
    } catch (err) {
        return res.status(500).json({ error: 'Error al obtener pedidos', details: err.message });
    }
}

export const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        const pedido = await Pedido.findById(id)
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio');

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        return res.status(200).json(pedido);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de pedido no válido', details: err.message });
        }
        return res.status(500).json({ error: 'Error al obtener pedido', details: err.message });
    }
}

export const updateOrder = async (req, res) => {
    try {
    const { id } = req.params;
    const { items, metodoPago, estado } = req.body;

    const pedidoExistente = await Pedido.findById(id);
    if (!pedidoExistente) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Si se envían nuevos items, recalcular subtotales y total
    let total = pedidoExistente.total;
    let itemsActualizados = pedidoExistente.items;

    if (items && items.length > 0) {
      total = 0;
      itemsActualizados = [];

      for (const item of items) {
        const producto = await Product.findById(item.producto);
        if (!producto) {
          return res.status(404).json({ error: `Producto con ID ${item.producto} no encontrado` });
        }

        const subtotal = producto.price * item.cantidad;
        total += subtotal;

        itemsActualizados.push({
          producto: producto._id,
          cantidad: item.cantidad,
          subtotal,
        });
      }
    }

    pedidoExistente.items = itemsActualizados;
    pedidoExistente.total = total;
    if (metodoPago) pedidoExistente.metodoPago = metodoPago;
    if (estado) pedidoExistente.estado = estado;

    const pedidoActualizado = await pedidoExistente.save();

    const pedidoFinal = await Pedido.findById(pedidoActualizado._id)
      .populate("usuario", "nombre email")
      .populate("items.producto", "name price");

    return res.status(200).json(pedidoFinal);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "ID de pedido no válido", details: err.message });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Datos de actualización inválidos", details: err.message });
    }
    return res.status(500).json({ error: "Error al actualizar pedido", details: err.message });
  }
};


export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoEliminado = await Pedido.findByIdAndDelete(id);

        if (!pedidoEliminado) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        return res.status(200).json({ message: 'Pedido eliminado correctamente' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de pedido no válido', details: err.message });
        }
        return res.status(500).json({ error: 'Error al eliminar pedido', details: err.message });
    }
}

//Actualizar estado del pedido
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ error: "Debe indicar un estado válido" });
        }

        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            id,
            { estado },
            { new: true, runValidators: true }
        )
        .populate('usuario', 'nombre email')
        .populate('items.producto', 'nombre precio');

        if (!pedidoActualizado) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }

        return res.status(200).json(pedidoActualizado);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "ID de pedido no válido", details: err.message });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: "Estado inválido", details: err.message });
        }
        return res.status(500).json({ error: "Error al actualizar estado del pedido", details: err.message });
    }
};

export const orderStats = async (req, res, next) => {
  try {
    // Estadísticas por estado
    const statsPorEstado = await Pedido.aggregate([
      {
        $group: {
          _id: '$estado',
          total: { $sum: 1 },
          montoTotal: { $sum: '$total' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Ventas por mes (últimos 6 meses)
    const ventasPorMes = await Pedido.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          },
          estado: { $ne: 'cancelado' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalVentas: { $sum: '$total' },
          totalPedidos: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          periodo: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          totalVentas: 1,
          totalPedidos: 1
        }
      }
    ]);

    // Total general
    const totalGeneral = await Pedido.aggregate([
      {
        $match: { estado: { $ne: 'cancelado' } }
      },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: '$total' },
          totalPedidos: { $sum: 1 },
          pedidoPromedio: { $avg: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        porEstado: statsPorEstado,
        ventasPorMes,
        totalGeneral: totalGeneral[0] || {
          totalVentas: 0,
          totalPedidos: 0,
          pedidoPromedio: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const pedidos = await Pedido.find({ usuario: userId })
      .populate('items.producto', 'nombre precio')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } 
};