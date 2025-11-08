import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const AddressSchema = new mongoose.Schema({
  line1: { type: String, required: true },  
  city: String,
  state: String,
  postalCode: String,
  country: String
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  bio: String,
  avatarUrl: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [AddressSchema],
  profile: ProfileSchema
}, { timestamps: true });

export default UserSchema;