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

  async purchaseMembership(userId, paketId) {
    // 1. Ambil paket
    const paket = await this.paketMembershipRepository.findById(paketId);

    if (!paket) {
      throw new Error('Paket tidak ditemukan');
    }

    // 2. Simpan membership
    const membershipData = {
      id_user: userId,
      id_paket: paketId,
      status: 'Pending',
    };

    const savedMembership =
      await this.membershipRepository.create(membershipData);

    // 3. Notifikasi ke Admin
    await this.notificationService.notifyAdmins(
      "Membership Baru",
      `Member ${userId} membeli paket ${paket.nama_paket}`
    );

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

  async softDeleteUserMembership(idMembership) {
    const existingMembership =
      await this.membershipRepository.findById(idMembership);

    if (!existingMembership) {
      throw new AppError('Data membership tidak ditemukan', 404);
    }

    return await this.membershipRepository.softDelete(idMembership);
  }
}