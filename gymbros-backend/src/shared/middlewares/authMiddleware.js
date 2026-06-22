import jwt from 'jsonwebtoken';
import { AppError } from '../core/AppError.js';

export const protect = (req, res, next) => {
  let token;

  // Cek apakah ada token di header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Anda belum login. Silakan login untuk mendapatkan akses.', 401));
  }

  try {
    // Langsung verifikasi token di sini
    const JWT_SECRET = process.env.JWT_SECRET || 'GymBrosSecretKey2026_SangatAman';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Simpan payload token (id_user & role) ke object request agar bisa dipakai oleh Controller
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.', 401));
  }
};

// Middleware untuk membatasi akses berdasarkan role
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Anda tidak memiliki izin untuk mengakses fitur ini.', 403));
    }
    next();
  };
};