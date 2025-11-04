import express from "express";
import userRoutes from "./router/userRoutes.js";
import product from "./router/productRoutes.js";
import bodyParser from "body-parser";
import { connectDB } from "./config/dbClient.js";
import categoryRoutes from "./router/categoryRoutes.js";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/products', product);
app.use('/api/categorias', categoryRoutes);

const Port = process.env.PORT || 3000;

// Conectar a la base de datos antes de arrancar el servidor
try{
    await connectDB();
    app.listen(Port, () => {
        console.log(`Server running on port ${Port}`);
    }).on('error', (err) => console.error('Server error:', err));
}catch(error){
    console.error('Error starting server (DB connection failed):', error);
    process.exit(1);
}