export class PaketCoaching {
  constructor({ idPaketCoaching, idPayment, idMember, idCoach, totalSesi, sisaSesi, statusPaket }) {
    this.idPaketCoaching = idPaketCoaching;
    this.idPayment = idPayment;
    this.idMember = idMember;
    this.idCoach = idCoach;
    this.totalSesi = totalSesi;
    this.sisaSesi = sisaSesi;
    this.statusPaket = statusPaket; // 'Aktif' atau 'Selesai'
  }

  hasQuota() {
    return this.sisaSesi > 0 && this.statusPaket === 'Aktif';
  }
}