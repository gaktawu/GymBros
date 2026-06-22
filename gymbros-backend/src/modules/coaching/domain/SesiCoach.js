export class SesiCoach {
  constructor({ idSesi, idCoach, tanggalSesi, waktuMulai, waktuSelesai, idPaketCoaching, statusKehadiran }) {
    this.idSesi = idSesi;
    this.idCoach = idCoach;
    this.tanggalSesi = tanggalSesi;
    this.waktuMulai = waktuMulai;
    this.waktuSelesai = waktuSelesai;
    this.idPaketCoaching = idPaketCoaching;
    this.statusKehadiran = statusKehadiran; // 'Tersedia', 'Booked', 'Hadir', 'Dibatalkan'
  }

  isAvailable() {
    return this.statusKehadiran === 'Tersedia';
  }
}