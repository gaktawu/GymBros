import express from 'express';
import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentUseCase } from '../application/payment.usecase.js';
import { PaymentController } from './payment.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { createInvoiceSchema } from './payment.validation.js';
import { NotificationService } from '../../notifications/application/notification.service.js';

const router = express.Router();

const paymentRepo = new PaymentRepository();
// const notificationService = new NotificationService(); // aktifkan kalau modul notifikasi sudah siap
const paymentUseCase = new PaymentUseCase(paymentRepo /*, notificationService */);
const paymentController = new PaymentController(paymentUseCase);

router.post('/webhook', asyncHandler(paymentController.handleMidtransWebhook));

// --- ROUTE YANG MEMERLUKAN AUTENTIKASI ---
router.use(protect);

router.post('/invoice', validate(createInvoiceSchema), asyncHandler(paymentController.createInvoice));
router.get('/invoice/:id', asyncHandler(paymentController.getInvoice));

// Simulasi hanya untuk sandbox/dev - usecase menolak otomatis di production
router.post('/simulate-qris/:id', asyncHandler(paymentController.simulateQRIS));

export default router;