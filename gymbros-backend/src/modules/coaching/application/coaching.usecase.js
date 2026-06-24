import { AppError } from '../../../shared/core/AppError.js';

export class CoachingUseCase {
  constructor(coachingRepository) {
    this.coachingRepository = coachingRepository;
  }

  // Use Case untuk Coach: Membuka slot waktu mengajar
  async addSession(idCoach, data) {
    if (data.waktuMulai >= data.waktuSelesai) {
      throw new AppError('Waktu mulai harus lebih awal dari waktu selesai', 400);
    }
    return await this.coachingRepository.createSession(idCoach, data);
  }

  // Use Case untuk Member: Membeli paket dengan Coach tertentu
  async buyPackage(idMember, idCoach) {
    // Cek apakah member masih punya paket aktif dengan coach ini
    const activePackage = await this.coachingRepository.findActivePackage(idMember, idCoach);
    if (activePackage) {
      throw new AppError('Anda masih memiliki paket aktif (sisa kuota) dengan Coach ini.', 400);
    }

    return await this.coachingRepository.createPackageMock(idMember, idCoach);
  }

  // Use Case untuk Member: Mengunci jadwal slot yang sudah dibuka oleh Coach
  async bookSession(idMember, idSesi) {
    const sesi = await this.coachingRepository.findSessionById(idSesi);
    if (!sesi) throw new AppError('Sesi tidak ditemukan', 404);
    if (!sesi.isAvailable()) throw new AppError('Sesi ini sudah tidak tersedia (Booked/Dibatalkan)', 400);

    // Cari paket member yang sesuai dengan coach pada sesi tersebut
    const activePackage = await this.coachingRepository.findActivePackage(idMember, sesi.idCoach);
    if (!activePackage || !activePackage.hasQuota()) {
      throw new AppError('Anda tidak memiliki kuota paket yang aktif dengan Coach ini', 403);
    }

    // Eksekusi Transaksi (Ubah slot jadi Booked & Potong Kuota Sisa Sesi)
    return await this.coachingRepository.bookSessionTransaction(idSesi, activePackage.idPaketCoaching);
  }
}