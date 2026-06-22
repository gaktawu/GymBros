export class Notification {
  constructor({ idNotifikasi, idUser, judul, pesan, waktuDikirim, statusBaca }) {
    this.idNotifikasi = idNotifikasi;
    this.idUser = idUser;
    this.judul = judul;
    this.pesan = pesan;
    this.waktuDikirim = waktuDikirim;
    this.statusBaca = statusBaca; // 0 = Unread, 1 = Read
  }

  isUnread() {
    return this.statusBaca === 0;
  }
}