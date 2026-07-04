export class Payment {
  // PASTIKAN snapToken dan redirectUrl ADA DI DALAM KURUNG KURAWAL INI
  constructor({ idPayment, idUser, kategoriTransaksi, totalTagihan, totalDibayar, metode, status, waktuBayar, snapToken, redirectUrl }) {
    this.idPayment = idPayment;
    this.idUser = idUser;
    this.kategoriTransaksi = kategoriTransaksi;
    this.totalTagihan = parseFloat(totalTagihan);
    this.totalDibayar = parseFloat(totalDibayar);
    this.metode = metode;
    this.status = status;
    this.waktuBayar = waktuBayar;
    
    // Properti Baru
    this.snapToken = snapToken;
    this.redirectUrl = redirectUrl;
  }

  isPaid() {
    return this.status === 'Lunas';
  }

  isPending() {
    return this.status === 'Pending';
  }

  isFailed() {
    return this.status === 'Gagal';
  }
}