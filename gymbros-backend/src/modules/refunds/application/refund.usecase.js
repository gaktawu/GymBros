import { AppError } from '../../../shared/core/AppError.js';

export class RefundUseCase {
  constructor(refundRepository) {
    this.refundRepository = refundRepository;
  }

  async requestRefund(data) {
    // Logika Bisnis: Menghitung jumlah bersih yang diterima konsumen secara otomatis
    const jumlahRefund = data.totalAwal - data.potonganDenda;
    if (jumlahRefund < 0) {
      throw new AppError('Potongan denda tidak boleh melebihi total bayar awal', 400);
    }

    return await this.refundRepository.create({
      ...data,
      jumlahRefund,
    });
  }

  async getAdminQueue() {
    return await this.refundRepository.findPendingRefunds();
  }

  async approveRefund(idRefund) {
    const updated = await this.refundRepository.updateStatusToSuccess(idRefund);
    if (!updated) throw new AppError('Data refund tidak ditemukan', 404);
    return updated;
  }
}