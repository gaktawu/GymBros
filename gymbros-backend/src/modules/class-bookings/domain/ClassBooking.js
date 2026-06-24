export class ClassBooking {
  constructor({ idBooking, idKelas, idUser, status, waktuBooking }) {
    this.idBooking = idBooking;
    this.idKelas = idKelas;
    this.idUser = idUser;
    this.status = status; // 'Booked' atau 'Cancelled'
    this.waktuBooking = waktuBooking;
  }

  // Domain Behavior
  isActive() {
    return this.status === 'Booked';
  }
}