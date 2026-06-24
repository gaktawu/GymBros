import express from 'express';
import { NotificationRepository } from '../infrastructure/notification.repository.js';
import { NotificationUseCase } from '../application/notification.usecase.js';
import { NotificationController } from './notification.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { protect } from '../../../shared/middlewares/authMiddleware.js';

const router = express.Router();

const notificationRepo = new NotificationRepository();
const notificationUseCase = new NotificationUseCase(notificationRepo);
const notificationController = new NotificationController(notificationUseCase);

// Semua route mewajibkan login
router.use(protect);

// Endpoint untuk melihat dan membaca notifikasi
router.get('/', asyncHandler(notificationController.getMyNotifications));
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

export default router;