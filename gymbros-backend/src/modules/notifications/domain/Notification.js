// src/modules/notifications/domain/Notification.js
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

  toJSON() {
    return {
      id_notifikasi: this.idNotifikasi,
      id_user: this.idUser,
      judul: this.judul,
      pesan: this.pesan,
      waktu_dikirim: this.waktuDikirim,
      status_baca: this.statusBaca === 0 ? 'Pending' : 'Closed',
    };
  }
}