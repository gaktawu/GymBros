import { snap } from '../../../shared/config/midtrans.js';

export class MembershipUseCase {
  constructor(membershipRepository, paketMembershipRepository) {
    this.membershipRepository = membershipRepository;
    this.paketMembershipRepository = paketMembershipRepository;
  }

  async purchaseMembership(userId, paketId) {
    // 1. Ambil detail paket (untuk mendapatkan harga)
    const paket = await this.paketMembershipRepository.findById(paketId);
    if (!paket) throw new Error('Paket tidak ditemukan');

    // 2. Simpan ke database dengan status PENDING
    // Pastikan di repository/domain Anda menyimpan transaction_status = 'PENDING'
    const membershipData = {
      id_user: userId,
      id_paket: paketId,
      status: 'Pending', // <-- Status awal pending
      // ...tanggal mulai/selesai dll
    };
    const savedMembership = await this.membershipRepository.create(membershipData);

    // 3. Buat Custom Order ID dengan Prefix
    // Format: MBR-[ID_DB]
    const orderId = `MBR-${savedMembership.id_membership}`;

    // 4. Siapkan parameter untuk Midtrans Snap
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: paket.harga
      },
      customer_details: {
        // ... ambil dari data user jika ada
        first_name: "Member",
        email: "member@gymbros.com"
      }
    };

    // 5. Generate Snap Token
    const snapTransaction = await snap.createTransaction(parameter);
    
    // KIRIM NOTIFIKASI OTOMATIS
    await this.notificationUseCase.createNotification(
      id_user,
      "Membership Berhasil Diaktifkan",
      "Halo! Paket membership Anda telah aktif. Selamat berlatih!"
    );

    // 6. Return ke frontend
    return {
      order_id: orderId,
      token: snapTransaction.token,
      redirect_url: snapTransaction.redirect_url
    };
  }
}