import { AppError } from '../../../shared/core/AppError.js';

export class EquipmentUseCase {
  constructor(equipmentRepository) {
    this.equipmentRepository = equipmentRepository;
  }

  

  async addEquipment(data) {
    // Cek apakah kode alat (id_alat) sudah digunakan
    const existingEq = await this.equipmentRepository.findById(data.idAlat);
    if (existingEq) {
      throw new AppError('Kode alat (ID) sudah terdaftar di sistem', 400);
    }
    return await this.equipmentRepository.create(data);
  }

  async getAllEquipment() {
    return await this.equipmentRepository.findAll();
  }

  async updateEquipmentStatus(idAlat, statusKondisi) {
    const equipment = await this.equipmentRepository.findById(idAlat);
    if (!equipment) {
      throw new AppError('Alat gym tidak ditemukan', 404);
    }
    return await this.equipmentRepository.updateStatus(idAlat, statusKondisi);
  }

  async deleteEquipment(idAlat) {
    // Cek apakah alat ada di database
    const equipment = await this.equipmentRepository.findById(idAlat);
    if (!equipment) {
      throw new AppError('Alat gym tidak ditemukan atau sudah dihapus', 404);
    }
    return await this.equipmentRepository.delete(idAlat);
  }
}