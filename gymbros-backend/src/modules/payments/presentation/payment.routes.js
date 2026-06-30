import express from 'express';
import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentUseCase } from '../application/payment.usecase.js';
import { PaymentController } from './payment.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { createInvoiceSchema } from './payment.validation.js';

// HAPUS baris ini:
// import { handleMidtransWebhook } from './payment.controller.js';

const router = express.Router();

const paymentRepo = new PaymentRepository();
const paymentUseCase = new PaymentUseCase(paymentRepo);
const paymentController = new PaymentController(paymentUseCase);


// --- WEBHOOK MIDTRANS (TANPA PROTECT) ---
// Midtrans memanggil endpoint ini dari luar, jangan pakai middleware auth
router.post('/webhook', asyncHandler(paymentController.handleMidtransWebhook));

// --- ROUTE YANG MEMERLUKAN AUTHENTIKASI ---
router.use(protect);

router.post('/invoice', validate(createInvoiceSchema), asyncHandler(paymentController.createInvoice));
router.get('/invoice/:id', asyncHandler(paymentController.getInvoice));

// Rute Simulasi (Bisa dibatasi untuk Admin atau Development only)
router.post('/simulate-qris/:id', asyncHandler(paymentController.simulateQRIS));

export default router;