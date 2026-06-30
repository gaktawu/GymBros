import { AppError } from '../../../shared/core/AppError.js';

export class PaymentUseCase {
  constructor(
    membershipRepo,
    classBookingRepo,
    coachingRepo,
    notificationService
  ) {
    this.membershipRepo = membershipRepo;
    this.classBookingRepo = classBookingRepo;
    this.coachingRepo = coachingRepo;
    this.notificationService = notificationService;
  }

  async processWebhook(notification) {
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let localStatus = 'Pending';

    // Mapping Status Midtrans -> Database
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        localStatus = 'Pending';
      } else if (fraudStatus === 'accept') {
        localStatus = 'Aktif/Success';
      }
    } else if (transactionStatus === 'settlement') {
      localStatus = 'Aktif/Success';
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      localStatus = 'Gagal/Batal';
    } else if (transactionStatus === 'pending') {
      localStatus = 'Pending';
    }

    // Ambil ID asli dari Order ID
    const dbId = orderId.split('-')[1];

    // ===========================
    // MEMBERSHIP
    // ===========================
    if (orderId.startsWith('MBR-')) {
      await this.membershipRepo.updateStatus(dbId, localStatus);

      if (localStatus === 'Aktif/Success') {
        const membership = await this.membershipRepo.findById(dbId);

        await this.notificationService.notifyAdmins(
          'Pembayaran Diterima',
          `Order ${orderId} sukses.`
        );

        await this.notificationService.notifyMember(
          membership.id_user,
          'Pembayaran Berhasil',
          'Terima kasih, paket membership Anda telah aktif.'
        );
      }
    }

    // ===========================
    // BOOKING KELAS
    // ===========================
    else if (orderId.startsWith('KLS-')) {
      await this.classBookingRepo.updateStatus(dbId, localStatus);

      if (localStatus === 'Aktif/Success') {
        const booking = await this.classBookingRepo.findById(dbId);

        await this.notificationService.notifyAdmins(
          'Pembayaran Diterima',
          `Order ${orderId} sukses.`
        );

        await this.notificationService.notifyMember(
          booking.id_user,
          'Pembayaran Berhasil',
          'Pembayaran booking kelas berhasil.'
        );
      }
    }

    // ===========================
    // COACHING
    // ===========================
    else if (orderId.startsWith('CCH-')) {
      await this.coachingRepo.updateStatus(dbId, localStatus);

      if (localStatus === 'Aktif/Success') {
        const coaching = await this.coachingRepo.findById(dbId);

        await this.notificationService.notifyAdmins(
          'Pembayaran Diterima',
          `Order ${orderId} sukses.`
        );

        await this.notificationService.notifyMember(
          coaching.id_user,
          'Pembayaran Berhasil',
          'Pembayaran sesi coaching berhasil.'
        );
      }
    }

    return {
      success: true,
      status: localStatus
    };
  }
}