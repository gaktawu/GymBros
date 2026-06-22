import express from 'express';
import { AuthRepository } from '../infrastructure/auth.repository.js';
import { AuthUseCase } from '../application/auth.usecase.js';
import { AuthController } from './auth.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = express.Router();

// Dependency Injection Setup
const authRepository = new AuthRepository();
const authUseCase = new AuthUseCase(authRepository);
const authController = new AuthController(authUseCase);

// Routes
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));

export default router;