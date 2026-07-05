// src/modules/payments/interfaces/payment.controller.js
export class PaymentController {
  constructor(paymentUseCase, notificationUseCase, notificationService) {
    this.paymentUseCase = paymentUseCase;
    this.notificationUseCase = notificationUseCase;
    this.notificationService = notificationService;
  }

  handleMidtransWebhook = async (req, res) => {
    try {
      const result = await this.paymentUseCase.processWebhook(req.body);
      res.status(200).json({ status: 'OK', ...result });
    } catch (error) {
      console.error('Webhook Error:', error.message);
      const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
      res.status(statusCode).json({ status: 'FAILED', message: error.message });
    }
  };

  createInvoice = async (req, res, next) => {
    try {
      const idUser = req.user.id_user;
      const result = await this.paymentUseCase.createInvoice(idUser, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInvoice = async (req, res, next) => {
    try {
      const result = await this.paymentUseCase.getInvoice(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  simulateQRIS = async (req, res, next) => {
    try {
      const result = await this.paymentUseCase.simulateQRIS(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  cancelInvoice = async (req, res, next) => {
    try {
      const result = await this.paymentUseCase.cancelInvoice(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getTransactionHistory = async (req, res, next) => {
    try {
      const idUser = req.user.id_user;
      const result = await this.paymentUseCase.getTransactionHistory(idUser, req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta 
      });
    } catch (error) {
      next(error);
    }
  };

  getRevenueStats = async (req, res, next) => {
    try {
      const result = await this.paymentUseCase.getRevenueStats(req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // --- ENDPOINT BARU UNTUK TRIGGER NOTIFIKASI SUKSES DARI FRONTEND ---
  confirmPayment = async (req, res, next) => {
    try {
      const idUser = req.user.id_user;
      const idPayment = req.params.id;
      const { nama_paket } = req.body;

      if (this.notificationUseCase) {
        await this.notificationUseCase.createNotification(
          idUser,
          "Pembayaran Berhasil 🎉",
          `Pembayaran Anda untuk ${nama_paket || 'pesanan ini'} telah berhasil diverifikasi. Transaksi sukses!`
        );
      }

      if (this.notificationService) {
        await this.notificationService.notifyAdmins(
          "Pembayaran Lunas & Berhasil",
          `User ID: ${idUser} telah berhasil melunasi pembayaran untuk ${nama_paket || 'sebuah pesanan'} (Order ID: ${idPayment}).`
        );
      }

      res.status(200).json({ success: true, message: 'Notifikasi pembayaran sukses berhasil dikirim' });
    } catch (error) {
      next(error);
    }
  };
}