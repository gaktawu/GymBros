export class PaketMembership {
  constructor({ idPaket, namaPaket, durasiHari, harga, statusAktif }) {
    this.idPaket = idPaket;
    this.namaPaket = namaPaket;
    this.durasiHari = durasiHari;
    this.harga = harga;
    this.statusAktif = statusAktif;
  }

  // Behavior/Aturan Bisnis: Mengecek apakah paket ini bisa dibeli
  isAvailableForPurchase() {
    return this.statusAktif === 'Tersedia';
  }

  // Aturan Bisnis: Memastikan harga tidak negatif
  isValidPrice() {
    return this.harga >= 0;
  }
}