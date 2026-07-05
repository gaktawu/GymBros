export class Attendance {
  static MAX_DURATION_HOURS = 6;

  constructor({ idAbsensi, idUser, waktuCheckin, waktuCheckout, statusAkses }) {
    this.idAbsensi = idAbsensi;
    this.idUser = idUser;
    this.waktuCheckin = waktuCheckin ? new Date(waktuCheckin) : null;
    this.waktuCheckout = waktuCheckout ? new Date(waktuCheckout) : null;
    this.statusAkses = statusAkses;
  }

  isCurrentlyCheckedIn() {
    return this.statusAkses === 'Granted' && this.waktuCheckout === null;
  }

  static validateMembership(membership) {
    if (!membership) return false;
    if (membership.status !== 'Aktif') return false;

    const tglBerakhir = membership.tglBerakhir || membership.tgl_berakhir;
    if (!tglBerakhir) return false;

    const now = new Date();
  
    return new Date(tglBerakhir) >= now;
  }
}