import mongoose from "mongoose";

const carritoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: [
        {
            producto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            cantidad: { type: Number, required: true, min: 1 }
        }
    ],
    fechaCreacion: { type: Date, default: Date.now }
});

export const Carrito = mongoose.model("Carrito", carritoSchema);
