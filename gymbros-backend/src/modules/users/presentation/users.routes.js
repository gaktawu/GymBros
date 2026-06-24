import express from 'express';
import { UsersRepository } from '../infrastructure/users.repository.js';
import { UsersUseCase } from '../application/users.usecase.js';
import { UsersController } from './users.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { uploadImage } from '../../../shared/middlewares/uploadMiddleware.js';

const router = express.Router();

const usersRepository = new UsersRepository();
const usersUseCase = new UsersUseCase(usersRepository);
const usersController = new UsersController(usersUseCase);

// Semua route mewajibkan login
router.use(protect);

// Semua pengguna (Admin, Coach, Member) bisa melihat profil mereka sendiri
router.get('/profile', asyncHandler(usersController.getProfile));

// HANYA Admin yang boleh melihat daftar seluruh pengguna di database
router.get('/', restrictTo('Admin'), asyncHandler(usersController.getAllUsers));

// HARUS HANYA ADA SATU INI
router.patch(
  '/profile',
  uploadImage.single('avatar'),
  asyncHandler(usersController.updateProfile)
);

export default router;