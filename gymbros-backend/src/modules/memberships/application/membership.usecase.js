// src/modules/membership/application/membership.usecase.js
import { snap } from '../../../shared/config/midtrans.js';
import { AppError } from '../../../shared/core/AppError.js';

export class MembershipUseCase {
  constructor(
    membershipRepository,
    paketMembershipRepository,
    notificationService
  ) {
    this.membershipRepository = membershipRepository;
    this.paketMembershipRepository = paketMembershipRepository;
    this.notificationService = notificationService;
  }

  // ==========================================
  // KODE BARU: Beli Membership Langsung Aktif
  // ==========================================
  async buyMembership(idUser, idPaket, dataPembayaran) {
    // 1. LOGIKA UTAMA (Simpan ke payments & membership dengan status 'Aktif')
    const membershipResult = await this.membershipRepository.createMembershipTransaction(idUser, idPaket, dataPembayaran);

    // 2. LOGIKA NOTIFIKASI (Dengan pengaman try-catch)
    try {
      // Kirim notifikasi ke Member yang membeli
      await this.notificationService.notifyMember(
        idUser,
        "Pembelian Membership Berhasil 🎉",
        `Pembelian paket membership Anda telah berhasil diproses. Selamat bergabung dan selamat berlatih di GymBros!`
      );

      // Kirim notifikasi ke semua Admin
      await this.notificationService.notifyAdmins(
        "Pembelian Membership Baru",
        `Terdapat pembelian paket membership baru oleh User ID: ${idUser}. Segera pantau aktivitas sistem.`
      );
    } catch (notifError) {
      // Praktik terbaik: Jangan sampai gagal ngirim notif membuat proses beli error
      console.error("Gagal mengirim notifikasi:", notifError);
    }

    // Kembalikan hasil logika utama
    return membershipResult;
  }

  // ==========================================
  // KODE LAMA: Tetap Dipertahankan
  // ==========================================
  async purchaseMembership(userId, paketId) {
    // 1. Ambil paket
    const paket = await this.paketMembershipRepository.findById(paketId);

    if (!paket) {
      throw new Error('Paket tidak ditemukan');
    }

    // 2. Simpan membership dengan status Pending
    const membershipData = {
      id_user: userId,
      id_paket: paketId,
      status: 'Pending',
    };

    const savedMembership = await this.membershipRepository.create(membershipData);

    // 3. Notifikasi ke Admin
    try {
      await this.notificationService.notifyAdmins(
        "Membership Baru",
        `Member ${userId} membeli paket ${paket.nama_paket}`
      );
    } catch (notifError) {
      console.error("Gagal mengirim notifikasi admin:", notifError);
    }

    // 4. Order ID
    const orderId = `MBR-${savedMembership.id_membership}`;

    // 5. Parameter Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: paket.harga,
      },
      customer_details: {
        first_name: "Member",
        email: "member@gymbros.com",
      },
    };

    // 6. Generate Snap Token
    const snapTransaction = await snap.createTransaction(parameter);

    return {
      order_id: orderId,
      token: snapTransaction.token,
      redirect_url: snapTransaction.redirect_url,
    };
  }

  async getMyActiveMembership(userId) {
    const activeMembership = await this.membershipRepository.findActiveByUserId(userId);
    return activeMembership;
  }

  async softDeleteUserMembership(idMembership) {
    const existingMembership = await this.membershipRepository.findById(idMembership);

    if (!existingMembership) {
      throw new AppError('Data membership tidak ditemukan', 404);
    }

    return await this.membershipRepository.softDelete(idMembership);
  }
}