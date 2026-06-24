export class Equipment {
  constructor({ idAlat, namaAlat, kategori, statusKondisi, statusKetersediaan }) {
    this.idAlat = idAlat;
    this.namaAlat = namaAlat;
    this.kategori = kategori;
    this.statusKondisi = statusKondisi; // Akan bernilai: Available, Maintenance, Broken
    this.statusKetersediaan = statusKetersediaan;
  }

  isUsable() {
    return this.statusKondisi === 'Available';
  }
}