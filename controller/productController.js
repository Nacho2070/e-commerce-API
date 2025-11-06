import Product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

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
     const { min, max, marca } = req.params; 
    const filtro = {};

    // Filtrar por rango de precio
    if (min || max) {
      filtro.precio = {};
      if (min) filtro.precio.$gte = Number(min);
      if (max) filtro.precio.$lte = Number(max);
    }

    const productos = await Product.find(filtro);
    return res.status(200).json(productos);
  } catch (err) {
    return res.status(500).json({
      error: "Error al obtener productos",
      details: err.message,
    });
  }
};

// Productos más reseñados (top N)
export const topProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Cargar todos y ordenar por longitud del array reviews (sencillo y robust)
        const topProductsList = await Product.aggregate([
            {
                // [$lookup] 1. Unir la colección 'products' con la colección 'reviews'
                // para acceder a los datos de calificación.
                $lookup: {
                    from: 'reviews', // Nombre de la colección de reseñas (minúsculas, plural)
                    localField: 'reviews', // Campo en la colección Producto (el array de IDs)
                    foreignField: '_id', // Campo en la colección Review
                    as: 'reviewDetails' // Nombre del nuevo array que contendrá las reseñas
                }
            },
            {
                // [$match] 2. Opcional: Filtrar productos que no tienen ninguna reseña
                // $ne: 0 (implícito, dado que queremos reseñados)
                $match: {
                    'reviewDetails.0': { $exists: true } // Solo productos con al menos una reseña
                }
            },
            {
                // [$unwind] 3. Desestructurar el array 'reviewDetails'. 
                // Esto crea un documento por cada reseña que tiene el producto.
                $unwind: '$reviewDetails' 
            },
            {
                // [$group] 4. Agrupar nuevamente por el ID del producto y calcular métricas.
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' }, // Mantener el nombre del producto
                    brand: { $first: '$brand' },
                    price: { $first: '$price' },
                    
                    // [$avg] Calcular el promedio de las calificaciones
                    avgRating: { $avg: '$reviewDetails.rating' },
                    
                    // [$sum / $count] Contar el número total de reseñas
                    reviewCount: { $sum: 1 } 
                }
            },
            {
                // [$sort] 5. Ordenar: Primero por promedio de calificación (descendente) 
                // y luego por cantidad de reseñas (desempate).
                $sort: { avgRating: -1, reviewCount: -1 } 
            },
            {
                // [$limit] 6. Limitar los resultados al Top N (10 por defecto)
                $limit: limit 
            }
        ]);

        res.status(200).json({ success: true, data: topProductsList });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PATCH /:id/stock -> actualizar stock (valor absoluto con `stock` o ajuste con `adjust`)
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

/*
//Producto mas resenado

export const productoMasResenado = async (req, res) => {
  try {
    const resultado = await Producto.aggregate([
      {
        $lookup: {
          from: "resenas",
          localField: "_id",
          foreignField: "producto",
          as: "reseñas"
        }
      },
      {
        $addFields: {
          cantidadResenas: { $size: "$reseñas" }
        }
      },
      { $sort: { cantidadResenas: -1 } },
      { $limit: 1 },
      {
        $project: {
          nombre: 1,
          descripcion: 1,
          precio: 1,
          cantidadResenas: 1
        }
      }
    ]);

    if (!resultado.length) {
      return res.status(404).json({ message: "No hay productos con reseñas" });
    }

    res.status(200).json(resultado[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el producto más reseñado", details: err.message });
  }
};
*/