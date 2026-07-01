import { AppError } from '../../../shared/core/AppError.js';
import { snap } from '../../../shared/config/midtrans.js';
import { verifyMidtransSignature } from '../infrastructure/midtransSignature.js';

const HARGA_PER_SESI_COACHING = Number(process.env.HARGA_PER_SESI_COACHING || 150000);

export class PaymentUseCase {
  constructor(paymentRepo, notificationService = null) {
    this.paymentRepo = paymentRepo;
    this.notificationService = notificationService;
  }


  async createInvoice(idUser, payload) {
    const { kategoriTransaksi, idPaket, idCoach, totalSesi, metode } = payload;

    let totalTagihan;
    let idPayment;
    let itemDetails;

    if (kategoriTransaksi === 'Membership') {
      const paket = await this.paymentRepo.getPaketMembershipById(idPaket);
      if (!paket) {
        throw new AppError('Paket membership tidak ditemukan atau tidak tersedia', 404);
      }

      totalTagihan = Number(paket.harga);
      idPayment = `MBR-${idPaket}-${idUser}-${Date.now()}`;
      itemDetails = [
        {
          id: `PKT-${idPaket}`,
          price: totalTagihan,
          quantity: 1,
          name: paket.nama_paket,
        },
      ];
    } else if (kategoriTransaksi === 'Paket_Coaching') {
      const coach = await this.paymentRepo.getCoachById(idCoach);
      if (!coach) {
        throw new AppError('Coach tidak ditemukan atau tidak aktif', 404);
      }
      if (!totalSesi || totalSesi <= 0) {
        throw new AppError('Jumlah sesi tidak valid', 400);
      }

      totalTagihan = HARGA_PER_SESI_COACHING * totalSesi;
      idPayment = `CCH-${idCoach}-${totalSesi}-${idUser}-${Date.now()}`;
      itemDetails = [
        {
          id: `CCH-${idCoach}`,
          price: HARGA_PER_SESI_COACHING,
          quantity: totalSesi,
          name: `Sesi Coaching bersama ${coach.nama_lengkap}`,
        },
      ];
    } else {
      throw new AppError('Kategori transaksi tidak dikenali', 400);
    }

    // 1. Simpan invoice dulu dengan harga yang SUDAH divalidasi server
    const payment = await this.paymentRepo.createInvoice({
      idPayment,
      idUser,
      kategoriTransaksi,
      totalTagihan,
      metode,
    });

    // 2. Minta Snap Token ke Midtrans Sandbox
    const parameter = {
      transaction_details: {
        order_id: idPayment,
        gross_amount: totalTagihan,
      },
      item_details: itemDetails,
      credit_card: { secure: true },
    };

    const midtransResponse = await snap.createTransaction(parameter);

    return {
      idPayment: payment.idPayment,
      totalTagihan: payment.totalTagihan,
      status: payment.status,
      snapToken: midtransResponse.token,
      redirectUrl: midtransResponse.redirect_url,
    };
  }

  async getInvoice(idPayment, requestingUser) {
    const payment = await this.paymentRepo.findById(idPayment);
    if (!payment) {
      throw new AppError('Invoice tidak ditemukan', 404);
    }
    // Member hanya boleh melihat invoice miliknya sendiri; Admin bebas akses
    if (requestingUser.peran !== 'Admin' && payment.idUser !== requestingUser.id_user) {
      throw new AppError('Anda tidak memiliki akses ke invoice ini', 403);
    }
    return payment;
  }


  async processWebhook(notification) {
    if (!verifyMidtransSignature(notification)) {
      throw new AppError('Signature tidak valid, notifikasi ditolak', 403);
    }

    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      gross_amount: grossAmount,
    } = notification;

    const payment = await this.paymentRepo.findById(orderId);
    if (!payment) {
      throw new AppError(`Payment dengan order_id ${orderId} tidak ditemukan`, 404);
    }

    if (!payment.isPending()) {
      // Sudah pernah diproses -> jangan proses ulang (idempotency)
      return { success: true, status: payment.status, note: 'already processed' };
    }

    if (Number(grossAmount) !== Number(payment.totalTagihan)) {
      throw new AppError('Nominal pembayaran tidak sesuai dengan invoice', 400);
    }

    const isSuccess =
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept');
    const isFailed = ['cancel', 'deny', 'expire'].includes(transactionStatus);

    if (isSuccess) {
      await this.paymentRepo.runInTransaction(async (client) => {
        await this.paymentRepo.markAsPaid(orderId, grossAmount, client);

        if (orderId.startsWith('MBR-')) {
          const [, idPaket] = orderId.split('-');
          const paket = await this.paymentRepo.getPaketMembershipById(idPaket);
          const tglMulai = new Date();
          const tglBerakhir = new Date(tglMulai);
          tglBerakhir.setDate(tglBerakhir.getDate() + (paket?.durasi_hari ?? 30));

          await this.paymentRepo.createMembership(
            {
              idUser: payment.idUser,
              idPaket,
              tglMulai,
              tglBerakhir,
              status: 'Aktif',
            },
            client
          );
        } else if (orderId.startsWith('CCH-')) {
          const [, idCoach, totalSesi] = orderId.split('-');
          await this.paymentRepo.createPaketCoachingMember(
            {
              idPayment: orderId,
              idMember: payment.idUser,
              idCoach,
              totalSesi: Number(totalSesi),
            },
            client
          );
        }
      });

      if (this.notificationService) {
        await this.notificationService.notifyMember(
          payment.idUser,
          'Pembayaran Berhasil',
          'Terima kasih, pembayaran Anda telah kami terima dan aktif.'
        );
      }

      return { success: true, status: 'Lunas' };
    }

    if (isFailed) {
      await this.paymentRepo.markAsFailed(orderId);
      return { success: true, status: 'Gagal' };
    }

    // transaction_status: 'pending' atau fraud_status: 'challenge'
    return { success: true, status: 'Pending' };
  }

  async simulateQRIS(idPayment) {
    if (process.env.MIDTRANS_IS_PRODUCTION === 'true') {
      throw new AppError('Simulasi tidak diizinkan di environment production', 403);
    }
    const payment = await this.paymentRepo.findById(idPayment);
    if (!payment) throw new AppError('Invoice tidak ditemukan', 404);

    return {
      message:
        'Buka Midtrans Simulator (Sandbox Dashboard) atau panggil endpoint sandbox status API Midtrans untuk memicu settlement. Webhook akan otomatis memproses setelah itu.',
      idPayment,
      status: payment.status,
    };
  }
}