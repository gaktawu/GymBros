export class Payment {
  constructor({ idPayment, idUser, kategoriTransaksi, totalTagihan, totalDibayar, metode, status, waktuBayar }) {
    this.idPayment = idPayment;
    this.idUser = idUser;
    this.kategoriTransaksi = kategoriTransaksi; // 'Membership' atau 'Paket_Coaching'
    this.totalTagihan = parseFloat(totalTagihan);
    this.totalDibayar = parseFloat(totalDibayar);
    this.metode = metode;
    this.status = status; // 'Pending', 'Lunas', 'Gagal'
    this.waktuBayar = waktuBayar;
  }

  isPaid() {
    return this.status === 'Lunas';
  }

  isPending() {
    return this.status === 'Pending';
  }
}