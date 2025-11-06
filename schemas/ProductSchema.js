
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: {
        type: mongoose.Schema.Types.ObjectId, // Referencia a la Categoría
        ref: 'Category',
        required: true
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    brand: String, // Para el filtro por marca
    reviews: [{ // Subdocumentos o referencia, aquí optamos por subdocumentos de referencia
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resena'
    }]
}, { timestamps: true });
export default ProductSchema;