import jwt from 'jsonwebtoken';
import { AppError } from '../core/AppError.js';
import { asyncHandler } from '../core/asyncHandler.js';
import { db } from '../config/database.js';

// 1. Middleware untuk memastikan user sudah login dan token valid
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Cek token di header Authorization (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Anda belum login. Silakan login untuk mendapatkan akses.', 401));
  }

  try {
    // Verifikasi token menggunakan secret key
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Cek apakah user dengan ID tersebut masih ada di database
    const query = `SELECT id_user, peran, status_akun FROM users WHERE id_user = $1`;
    const result = await db.query(query, [decoded.idUser]);
    const currentUser = result.rows[0];

    if (!currentUser) {
      return next(new AppError('Token valid, namun user sudah tidak ditemukan di sistem.', 401));
    }

    // Cek apakah akun aktif
    if (currentUser.status_akun === 'Nonaktif') {
      return next(new AppError('Akun Anda dinonaktifkan. Silakan hubungi Admin.', 403));
    }

    // Sisipkan data user ke dalam request object untuk digunakan oleh handler selanjutnya
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali.', 401));
  }
});

// 2. Middleware untuk membatasi akses berdasarkan Role (RBAC)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user diisi oleh middleware protect di atasnya
    if (!roles.includes(req.user.peran)) {
      return next(new AppError('Anda tidak memiliki izin (role) untuk melakukan aksi ini.', 403));
    }
    next();
  };
};