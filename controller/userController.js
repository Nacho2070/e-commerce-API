import User from '../models/User.js';
import { Carrito } from '../models/CartModel.js'; '../models/CartModel.js';
import jwt from 'jsonwebtoken';
import { encriptPass, validatePass } from "../services/password.service.js";
import { generateToken } from "../services/auth.service.js";
// Listar usuarios
export const listUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener usuario
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Crear usuario
export const createUser = async (req, res) => {
    try {
        const payload = req.body;

        const hashedPassword = await encriptPass(payload.password);

        payload.password = hashedPassword;
        
        const created = await User.create(payload);
        created.password = undefined; 
        
        res.status(201).json({ success: true, data: created });
    } catch (error) {
        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Borrar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ success: false, error: 'User not found' });
    
    await Carrito.deleteOne({ usuario: id });
    res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Agregar dirección a usuario
export const addAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { address } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    user.addresses.push(address);
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Eliminar dirección por índice
export const removeAddress = async (req, res) => {
  try {
    const { id, index } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= user.addresses.length) return res.status(400).json({ success: false, error: 'Invalid address index' });
    user.addresses.splice(idx, 1);
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son obligatorios'
      });
    }

    const user = await User.findOne({ email });
    
    if (await validatePass(password, user.password)) {
    
      const jwtToken = generateToken({
      id: user._id,
      email: user.email,
      rol: user.role,
    });

      res.json({
        success: true,
        data: {
          _id: user._id,
          nombre: user.name,
          email: user.email,
          direccion: user.addresses.line1,
          telefono: user.phone,
          rol: user.role,
          token: jwtToken
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
  } catch (error) {
    next(error);
  }
};