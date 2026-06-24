export class GymClass {
  constructor({ idKelas, namaKelas, idPelatih, kapasitas, waktuMulai, waktuSelesai, status, harga }) {
    this.idKelas = idKelas;
    this.namaKelas = namaKelas;
    this.idPelatih = idPelatih;
    this.kapasitas = kapasitas;
    this.waktuMulai = new Date(waktuMulai);
    this.waktuSelesai = new Date(waktuSelesai);
    this.status = status;
    this.harga = parseFloat(harga) || 0;
  }

  // Domain behavior: Memastikan jadwal logis
  isValidSchedule() {
    return this.waktuSelesai > this.waktuMulai;
  }

  // Domain behavior: Mengecek apakah kelas sudah tidak bisa dibooking karena waktu lewat
  isPast() {
    return new Date() >= this.waktuMulai;
  }
}