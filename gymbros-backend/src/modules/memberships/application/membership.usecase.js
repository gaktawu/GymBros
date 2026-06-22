import { AppError } from '../../../shared/core/AppError.js';

export class MembershipUseCase {
  // Inject dua repository sekaligus untuk kolaborasi lintas modul
  constructor(membershipRepository, paketMembershipRepository) {
    this.membershipRepository = membershipRepository;
    this.paketMembershipRepository = paketMembershipRepository;
  }

  async subscribe(idUser, idPaket) {
    // 1. ATURAN BISNIS KETAT: Cek apakah member sudah punya membership aktif
    const activeMembership = await this.membershipRepository.findActiveByUserId(idUser);
    if (activeMembership) {
      throw new AppError('Anda masih memiliki membership yang aktif. Tidak dapat membeli membership baru.', 400);
    }

    // 2. Ambil data paket untuk mengkalkulasi durasi
    const paket = await this.paketMembershipRepository.findById(idPaket);
    if (!paket) {
      throw new AppError('Paket membership tidak ditemukan', 404);
    }

    if (paket.statusAktif !== 'Tersedia') {
      throw new AppError('Paket membership ini saat ini tidak tersedia untuk dibeli', 400);
    }

    // 3. Kalkulasi Tanggal Mulai dan Berakhir
    const tglMulai = new Date();
    const tglBerakhir = new Date();
    // Menambahkan durasi hari dari paket ke tanggal saat ini
    tglBerakhir.setDate(tglMulai.getDate() + paket.durasiHari);

    // 4. Simpan ke database (Simulasi langsung Aktif. Di dunia nyata mungkin statusnya 'Pending' menunggu modul Payment)
    const newMembership = await this.membershipRepository.create({
      idUser,
      idPaket,
      tglMulai,
      tglBerakhir,
      status: 'Aktif' 
    });

    return newMembership;
  }

  async getMyActiveMembership(idUser) {
    return await this.membershipRepository.findActiveByUserId(idUser);
  }
}