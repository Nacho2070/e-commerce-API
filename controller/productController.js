import Product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';
import { Resena } from '../models/ReviewModel.js';

// Listar todos los productos con su categoría
export const listProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Obtener un producto por id
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category');
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const payload = req.body;
        const categoryId = payload.category;

         if (!categoryId) {
            return res.status(400).json({ success: false, error: 'Category id is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, error: 'Invalid category id' });
        }

        const categoryFromBd = await Category.findById(categoryId);
        if (!categoryFromBd) {
            return res.status(400).json({ success: false, error: 'Category not found' });
        }
        const created = await Product.create(payload);
        const populated = await created.populate('category');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Actualizar producto completo
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate('category');
        if (!updated) return res.status(404).json({ success: false, error: 'Product not found' });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Borrar producto
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });
        res.status(200).json({ success: true, data: deleted });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//Buscar por rango de precio
export const filterProducts = async (req, res) => {
  try {
    const { min, max, marca } = req.query;
    const filtro = {};
    
    if (min || max) {
      filtro.price = {};
      if (min) filtro.price.$gte = Number(min);
      if (max) filtro.price.$lte = Number(max);
    }

    if (marca) {
      filtro.brand = new RegExp(marca, "i");
    }

    const productos = await Product.find(filtro);

    if (productos.length === 0) {
      return res.status(404).json({ message: "No se encontraron productos con esos filtros" });
    }

    return res.status(200).json(productos);
  } catch (err) {
    return res.status(500).json({
      error: "Error al obtener productos",
      details: err.message,
    });
  }
};

// Productos más reseñados
export const topProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topProductsList = await Resena.aggregate([
            {
              
                $group: {
                    _id: '$producto', 
                   
                    avgRating: { $avg: '$calificacion' }, 
                   
                    reviewCount: { $sum: 1 } 
                }
            },
            {
                $sort: { avgRating: -1, reviewCount: -1 } 
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'products', 
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {                
                $unwind: '$productDetails'
            },
            {             
                $project: {
                    _id: '$_id',
                    name: '$productDetails.name',
                    brand: '$productDetails.brand',
                    price: '$productDetails.price',
                    avgRating: { $round: ['$avgRating', 2] },
                    reviewCount: '$reviewCount'
                }
            }
        ]);

        res.status(200).json({ success: true, data: topProductsList });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, adjust } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        if (typeof stock === 'number') {
            if (stock < 0) return res.status(400).json({ success: false, error: 'Stock cannot be negative' });
            product.stock = stock;
        } else if (typeof adjust === 'number') {
            const newStock = product.stock + adjust;
            if (newStock < 0) return res.status(400).json({ success: false, error: 'Resulting stock cannot be negative' });
            product.stock = newStock;
        } else {
            return res.status(400).json({ success: false, error: 'Provide `stock` (absolute) or `adjust` (delta) in body' });
        }

        await product.save();
        const populated = await product.populate('category');
        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
