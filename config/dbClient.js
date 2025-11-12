import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb+srv://user:KDwVYjpMf4wwRkRh@ecommerce.a5zyzto.mongodb.net/ecommerce?retryWrites=true&w=majority';
const LOCAL_URI = 'mongodb://localhost:27017/E-commerce';

export async function connectDB() {
  const uri = process.env.MONGO_URI || LOCAL_URI;
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}