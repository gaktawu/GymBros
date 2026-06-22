import express from 'express';
import { AuthRepository } from '../infrastructure/auth.repository.js';
import { AuthUseCase } from '../application/auth.usecase.js';
import { AuthController } from './auth.controller.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';

const router = express.Router();

// Dependency Injection
const authRepository = new AuthRepository();
const authUseCase = new AuthUseCase(authRepository);
const authController = new AuthController(authUseCase);

// Rute Public (Tidak butuh token)
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));

export default router;