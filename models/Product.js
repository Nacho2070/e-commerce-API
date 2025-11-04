import mongoose from 'mongoose';
import ProductSchema from '../schemas/ProductSchema.js';

// Create and export the Mongoose model for Product
const Product = mongoose.model('Product', ProductSchema);

export default Product;