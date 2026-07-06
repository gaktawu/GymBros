// src/modules/payments/interfaces/payment.routes.js
import express from 'express';
import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentUseCase } from '../application/payment.usecase.js';
import { PaymentController } from './payment.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { createInvoiceSchema } from './payment.validation.js';

// Import modul notifikasi untuk diinjeksi
import { NotificationRepository } from '../../notifications/infrastructure/notification.repository.js';
import { NotificationUseCase } from '../../notifications/application/notification.usecase.js';
import { NotificationService } from '../../notifications/application/notification.service.js';
import { UsersRepository } from '../../users/infrastructure/users.repository.js';

const router = express.Router();
const paymentRepo = new PaymentRepository();

// Inisialisasi Repository & Service Notifikasi
const notificationRepo = new NotificationRepository();
const usersRepo = new UsersRepository();
const notificationUseCase = new NotificationUseCase(notificationRepo);
const notificationService = new NotificationService(notificationRepo, usersRepo);

const paymentUseCase = new PaymentUseCase(paymentRepo, notificationService);

// Inject Payment & Notification ke dalam PaymentController
const paymentController = new PaymentController(paymentUseCase, notificationUseCase, notificationService);

router.post('/webhook', asyncHandler(paymentController.handleMidtransWebhook));

// --- ROUTE YANG MEMERLUKAN AUTENTIKASI ---
router.use(protect);
router.post('/invoice', validate(createInvoiceSchema), asyncHandler(paymentController.createInvoice));
router.get('/invoice/:id', asyncHandler(paymentController.getInvoice));
router.post('/invoice/:id/cancel', asyncHandler(paymentController.cancelInvoice));
router.get('/history', asyncHandler(paymentController.getTransactionHistory));
// ── CRON: Expire reserved bookings yang menggantung ──
router.post('/cron/expire-reserved', asyncHandler(paymentController.expireStaleReservedBookings));

// Endpoint memicu notifikasi sukses pembayaran
router.post('/invoice/:id/confirm', asyncHandler(paymentController.confirmPayment));

router.post('/simulate-qris/:id', asyncHandler(paymentController.simulateQRIS));
router.get('/revenue', asyncHandler(paymentController.getRevenueStats));

router.get('/my-invoices', asyncHandler(async (req, res) => {
  const idUser = req.user.id_user;
  const invoices = await paymentRepo.findByUserId(idUser);
  res.status(200).json({
    success: true,
    data: invoices.map(inv => ({
      id: inv.idPayment,
      id_payment: inv.idPayment,
      nama_item: inv.kategoriTransaksi === 'Membership' ? 'Membership' :
                 inv.kategoriTransaksi === 'Paket_Coaching' ? 'Paket Coaching' :
                 inv.kategoriTransaksi === 'Kelas' ? 'Kelas Gym' : 'Transaksi',
      metode: inv.metode,
      nominal: inv.totalTagihan,
      status: inv.status,
      tanggal: inv.waktuBayar || new Date().toISOString(),
      kategori: inv.kategoriTransaksi,
    }))
  });
}));

export default router;