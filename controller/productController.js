import Product from '../models/Product.js';

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

// Filtrar por rango de precio y marca
export const filterProducts = async (req, res) => {
    try {
        const { minPrice, maxPrice, brand } = req.query;
        let filter = { $and: [] };

        if (minPrice || maxPrice) {
            let priceQuery = {};
            if (minPrice) priceQuery.$gte = parseFloat(minPrice);
            if (maxPrice) priceQuery.$lte = parseFloat(maxPrice);
            filter.$and.push({ price: priceQuery });
        }

        if (brand) {
            filter.$and.push({ brand: brand });
        }

        if (filter.$and.length === 0) filter = {};
        else if (filter.$and.length === 1) filter = filter.$and[0];

        const products = await Product.find(filter).populate('category');
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Productos más reseñados (top N)
export const topProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        // Cargar todos y ordenar por longitud del array reviews (sencillo y robust)
        const products = await Product.find().populate('category');
        products.sort((a, b) => (b.reviews ? b.reviews.length : 0) - (a.reviews ? a.reviews.length : 0));
        res.status(200).json({ success: true, data: products.slice(0, limit) });
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

