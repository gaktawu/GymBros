import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../shared/core/AppError.js';

export class AuthUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async register(data) {
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await this.authRepository.create({
      ...data,
      password: hashedPassword, // Melempar password yang sudah di-hash
    });

    return newUser.toJSON(); 
  }

  async login(data) {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    // Membandingkan dengan passwordHash dari database
    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Email atau password salah', 401);
    }

    if (!user.isActive()) {
      throw new AppError('Akun Anda tidak aktif, silakan hubungi admin', 403);
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'GymBrosSecretKey2026_SangatAman';
    // Tetap menggunakan label "role" untuk token agar tidak merusak Middleware auth Anda
    const token = jwt.sign(
      { id_user: user.idUser, role: user.peran }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    return {
      user: user.toJSON(),
      token,
    };
  }
}