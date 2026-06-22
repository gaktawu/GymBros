import { AppError } from '../../../shared/core/AppError.js';

export class AuthController {
  constructor(authUseCase) {
    this.authUseCase = authUseCase;
  }

  register = async (req, res) => {
    // Di layer router nantinya kita sudah pasang middleware validasi Zod
    // Jadi di sini req.body dipastikan sudah sesuai skema
    const newUser = await this.authUseCase.register(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: newUser,
    });
  };

  login = async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await this.authUseCase.login(email, password);

    // Set refresh token ke HttpOnly Cookie (Opsional, tapi best practice)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        user,
        accessToken,
      },
    });
  };
}