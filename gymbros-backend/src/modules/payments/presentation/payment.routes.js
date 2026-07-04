import express from 'express';
import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentUseCase } from '../application/payment.usecase.js';
import { PaymentController } from './payment.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { createInvoiceSchema } from './payment.validation.js';
// import { NotificationService } from '../../notifications/application/notification.service.js';

const router = express.Router();
const paymentRepo = new PaymentRepository();

// Aktifkan notification service jika modul notifikasi sudah siap
const notificationService = null; // new NotificationService();
const paymentUseCase = new PaymentUseCase(paymentRepo, notificationService);
const paymentController = new PaymentController(paymentUseCase);

router.post('/webhook', asyncHandler(paymentController.handleMidtransWebhook));

// --- ROUTE YANG MEMERLUKAN AUTENTIKASI ---
router.use(protect);
router.post('/invoice', validate(createInvoiceSchema), asyncHandler(paymentController.createInvoice));
router.get('/invoice/:id', asyncHandler(paymentController.getInvoice));
// Route untuk membatalkan invoice yang masih Pending
router.post('/invoice/:id/cancel', asyncHandler(paymentController.cancelInvoice));
router.get('/history', asyncHandler(paymentController.getTransactionHistory));

// Simulasi hanya untuk sandbox/dev - usecase menolak otomatis di production
router.post('/simulate-qris/:id', asyncHandler(paymentController.simulateQRIS));

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