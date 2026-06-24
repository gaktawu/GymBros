export class Attendance {
  constructor({ idAbsensi, idUser, waktuCheckin, waktuCheckout, statusAkses }) {
    this.idAbsensi = idAbsensi;
    this.idUser = idUser;
    this.waktuCheckin = waktuCheckin ? new Date(waktuCheckin) : null;
    this.waktuCheckout = waktuCheckout ? new Date(waktuCheckout) : null;
    this.statusAkses = statusAkses;
  }

  // Domain Behavior
  isCurrentlyCheckedIn() {
    return this.statusAkses === 'Granted' && this.waktuCheckout === null;
  }
}