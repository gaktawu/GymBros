import { AppError } from '../../../shared/core/AppError.js';

export class PaketMembershipUseCase {
  constructor(paketMembershipRepository) {
    this.paketMembershipRepository = paketMembershipRepository;
  }

  async createPaket(data) {
    if (data.harga < 0) {
      throw new AppError('Aturan bisnis dilanggar: Harga tidak boleh negatif', 400);
    }
    return await this.paketMembershipRepository.create(data);
  }

  // Menerima parameter role untuk memfilter data
  async getAllPaket(role) {
    return await this.paketMembershipRepository.findAll(role);
  }

  async updateStatus(idPaket, statusAktif) {
    const existingPaket = await this.paketMembershipRepository.findById(idPaket);
    if (!existingPaket) throw new AppError('Paket membership tidak ditemukan', 404);
    return await this.paketMembershipRepository.updateStatus(idPaket, statusAktif);
  }

  async updatePaket(idPaket, data) {
    const existingPaket = await this.paketMembershipRepository.findById(idPaket);
    if (!existingPaket) throw new AppError('Paket membership tidak ditemukan', 404);
    if (data.harga && data.harga < 0) throw new AppError('Aturan bisnis dilanggar: Harga tidak boleh negatif', 400);
    return await this.paketMembershipRepository.updatePaket(idPaket, data);
  }

  async softDeletePaketById(idPaket) {
    const existingPaket = await this.paketMembershipRepository.findById(idPaket);
    if (!existingPaket) throw new AppError('Paket membership tidak ditemukan', 404);
    return await this.paketMembershipRepository.softDeletePaketById(idPaket);
  }
}