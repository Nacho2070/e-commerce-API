import express from "express";
import userRoutes from "./router/userRoutes.js";
import product from "./router/productRoutes.js";
import bodyParser from "body-parser";
import { connectDB } from "./config/dbClient.js";
import categoryRoutes from "./router/categoryRoutes.js";
import cartRoutes from "./router/cartRoutes.js";
import orderRoutes from "./router/orderRoutes.js";
import reviewRoutes from "./router/reviewRoutes.js";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/products', product);
app.use('/api/categorias', categoryRoutes);
app.use('/api/carrito', cartRoutes);
app.use('/api/ordenes', orderRoutes);
app.use('/api/resenas', reviewRoutes);

const Port = process.env.PORT || 3000;

try{
    await connectDB();
    app.listen(Port, () => {
        console.log(`Server running on port ${Port}`);
    }).on('error', (err) => console.error('Server error:', err));
}catch(error){
    console.error('Error starting server (DB connection failed):', error);
    process.exit(1);
}