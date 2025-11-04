import mongoose from 'mongoose';
import CategorySchema from '../schemas/CategorySchema.js';

const Category = mongoose.model('Category', CategorySchema);

export default Category;
