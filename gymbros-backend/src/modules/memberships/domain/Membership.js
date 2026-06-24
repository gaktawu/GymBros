export class Membership {
  constructor({ idMembership, idUser, idPaket, tglMulai, tglBerakhir, status, dibuatPada }) {
    this.idMembership = idMembership;
    this.idUser = idUser;
    this.idPaket = idPaket;
    this.tglMulai = tglMulai;
    this.tglBerakhir = tglBerakhir;
    this.status = status;
    this.dibuatPada = dibuatPada;
  }

  // Domain Behavior
  isActive() {
    return this.status === 'Aktif';
  }

  isExpired() {
    // Mengecek apakah waktu saat ini sudah melewati batas tanggal berakhir
    return new Date() > new Date(this.tglBerakhir);
  }
}