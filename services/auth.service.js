import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "default-secret";

export const generateToken = (user) => {
  const roles = user.role ?? user.rol ?? "customer";
  return jwt.sign({ id: user._id, role: roles }, secret, { expiresIn: process.env.JTW_EXPIRES_IN || "1h" });
};

export const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token requerido" });

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = decoded; //id, role
    next();
  });
};

// Middleware para admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Se requiere rol de administrador" });
  next();
};
