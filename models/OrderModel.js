import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            producto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            cantidad: { type: Number, required: true, min: 1 },
            subtotal: { type: Number, required: true, min: 0 }
        }
    ],
    fecha: { type: Date, default: Date.now },
    estado: {
        type: String,
        enum: ["pendiente", "procesando", "enviado", "entregado", "cancelado"],
        default: "pendiente"
    },
    total: { type: Number, required: true, min: 0 },
    metodoPago: {
        type: String,
        enum: ["efectivo", "tarjeta", "transferencia"],
        required: true
    }
});

export const Pedido = mongoose.model("Pedido", pedidoSchema);
