import { AppError } from '../../../shared/core/AppError.js';

export class PaketMembershipUseCase {
  constructor(paketMembershipRepository) {
    this.paketMembershipRepository = paketMembershipRepository;
  }

  async createPaket(data) {
    // Validasi tambahan di level domain/bisnis (Defense in depth)
    if (data.harga < 0) {
      throw new AppError('Aturan bisnis dilanggar: Harga tidak boleh negatif', 400);
    }
    return await this.paketMembershipRepository.create(data);
  }

  async getAllPaket() {
    return await this.paketMembershipRepository.findAll();
  }

  async updateStatus(idPaket, statusAktif) {
    // Pastikan paket yang akan diupdate benar-benar ada di database
    const existingPaket = await this.paketMembershipRepository.findById(idPaket);
    
    if (!existingPaket) {
      throw new AppError('Paket membership tidak ditemukan', 404);
    }

    return await this.paketMembershipRepository.updateStatus(idPaket, statusAktif);
  }

  
}