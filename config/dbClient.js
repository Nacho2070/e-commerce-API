import mongoose from 'mongoose';

// Prefer using an env var for the URI
const DEFAULT_URI = 'mongodb+srv://user:KDwVYjpMf4wwRkRh@ecommerce.a5zyzto.mongodb.net/ecommerce?retryWrites=true&w=majority';

export async function connectDB() {
  const uri = process.env.MONGO_URI || DEFAULT_URI;
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