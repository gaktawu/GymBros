import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../shared/core/AppError.js';

export class AuthUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async register(data) {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email sudah digunakan', 400);
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // 3. Simpan user ke database
    const newUser = await this.authRepository.createUser({
      ...data,
      passwordHash,
    });

    return newUser;
  }

  async login(email, password) {
    // 1. Cari user berdasarkan email
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    // 2. Verifikasi status akun
    if (user.status_akun === 'Nonaktif') {
      throw new AppError('Akun Anda dinonaktifkan, silakan hubungi Admin', 403);
    }

    // 3. Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Email atau password salah', 401);
    }

    // 4. Generate JWT
    const payload = {
      idUser: user.id_user,
      peran: user.peran,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Hapus password hash dari object user sebelum dikembalikan
    delete user.password_hash;

    return { user, accessToken, refreshToken };
  }
}