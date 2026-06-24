export class Refund {
  constructor({ idRefund, idPayment, idSesi, totalAwal, potonganDenda, jumlahRefund, informasiRekening, statusRefund, waktuPengajuan }) {
    this.idRefund = idRefund;
    this.idPayment = idPayment;
    this.idSesi = idSesi;
    this.totalAwal = parseFloat(totalAwal);
    this.potonganDenda = parseFloat(potonganDenda);
    this.jumlahRefund = parseFloat(jumlahRefund);
    this.informasiRekening = informasiRekening;
    this.statusRefund = statusRefund; // 'Pending', 'Success'
    this.waktuPengajuan = waktuPengajuan;
  }
}