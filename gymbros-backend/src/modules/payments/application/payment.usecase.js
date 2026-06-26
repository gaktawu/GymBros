import { AppError } from '../../../shared/core/AppError.js';

export class PaymentUseCase {
  constructor(membershipRepo, classBookingRepo, coachingRepo) {
    this.membershipRepo = membershipRepo;
    this.classBookingRepo = classBookingRepo;
    this.coachingRepo = coachingRepo;
  }

  async processWebhook(notification) {
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let localStatus = 'Pending';

    // Pemetaan Status Midtrans -> Database Anda
    if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge'){ localStatus = 'Pending'; }
        else if (fraudStatus == 'accept'){ localStatus = 'Aktif/Success'; }
    } else if (transactionStatus == 'settlement'){
        localStatus = 'Aktif/Success';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire'){
        localStatus = 'Gagal/Batal';
    } else if (transactionStatus == 'pending'){
        localStatus = 'Pending';
    }

    // Eksekusi Update berdasarkan Prefix Order ID
    const dbId = orderId.split('-')[1]; // Mendapatkan ID aslinya
    
    if (orderId.startsWith('MBR-')) {
       // Update status tabel membership
       await this.membershipRepo.updateStatus(dbId, localStatus);
    } 
    else if (orderId.startsWith('KLS-')) {
       // Update status tabel booking_kelas
       await this.classBookingRepo.updateStatus(dbId, localStatus);
    } 
    else if (orderId.startsWith('CCH-')) {
       // Update status tabel pemesanan coaching
       await this.coachingRepo.updateStatus(dbId, localStatus);
    }

    if (localStatus === 'Aktif/Success') {
    // 1. Update status di DB
    await this.membershipRepo.updateStatus(dbId, 'Aktif');

    // 2. Kirim Notifikasi ke Member
    await this.notificationUseCase.createNotification(
        userId,
        "Pembayaran Berhasil!",
        "Terima kasih, pembayaran Anda telah kami terima. Selamat menikmati layanan kami!"
    );

    // 3. Kirim Notifikasi ke Admin
    // Asumsikan kita punya fungsi untuk ambil ID admin atau broadcast
    await this.notificationUseCase.createNotification(
        ADMIN_ID,
        "Dana Diterima",
        `Penerimaan dana sukses sebesar Rp${notification.gross_amount} dari ${userName}`
    );
}
  }
}