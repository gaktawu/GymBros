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

router.get('/profile', asyncHandler(usersController.getProfile));
router.patch('/profile', uploadImage.single('avatar'), asyncHandler(usersController.updateProfile));

// --- ADMIN MANAGE MEMBERS ROUTE ---
router.get('/', restrictTo('Admin'), asyncHandler(usersController.getAllUsers));
router.post('/', restrictTo('Admin'), asyncHandler(usersController.createUser));
router.delete('/:id', restrictTo('Admin'), asyncHandler(usersController.deleteUser));

router.put('/:id', restrictTo('Admin'), asyncHandler(usersController.updateUserByAdmin));
router.patch('/:id/status', restrictTo('Admin'), asyncHandler(usersController.updateUserStatus));

export default router;