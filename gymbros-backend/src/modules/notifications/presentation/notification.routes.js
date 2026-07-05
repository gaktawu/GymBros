// src/modules/notifications/interfaces/notification.routes.js
import express from 'express';
import { NotificationRepository } from '../infrastructure/notification.repository.js';
import { NotificationUseCase } from '../application/notification.usecase.js';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from '../application/notification.service.js';
import { UsersRepository } from '../../users/infrastructure/users.repository.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { protect } from '../../../shared/middlewares/authMiddleware.js';

const router = express.Router();

const notificationRepo = new NotificationRepository();
const userRepo = new UsersRepository();
const notificationService = new NotificationService(notificationRepo, userRepo);
const notificationUseCase = new NotificationUseCase(notificationRepo);

const notificationController = new NotificationController(notificationUseCase, notificationService);

router.use(protect);

router.get('/mine', asyncHandler(notificationController.getMyNotifications));
router.get('/admin/all', asyncHandler(notificationController.getAllNotifications));
router.put('/:id/read', asyncHandler(notificationController.markAsRead));
router.delete('/:id', asyncHandler(notificationController.deleteNotification));
router.post('/trigger', asyncHandler(notificationController.triggerNotification));
router.post('/payment-trigger', asyncHandler(notificationController.triggerPaymentNotification));
export default router;