export class GymClass {
  constructor({ id, nama_kelas, pengajar, hari, jam_mulai, jam_selesai, kapasitas, harga, created_at, updated_at }) {
    this.id = id;
    this.nama_kelas = nama_kelas;
    this.pengajar = pengajar;
    this.hari = hari;
    this.jam_mulai = jam_mulai;
    this.jam_selesai = jam_selesai;
    this.kapasitas = kapasitas || 0;
    this.harga = harga || 0;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }


  // Domain behavior: Memastikan jadwal logis
  isValidSchedule() {
    return this.jam_selesai > this.jam_mulai;
  }

  isPast() {
    const now = new Date();
    const classDate = new Date(this.jam_mulai); // Asumsi jam_mulai bisa di-parse ke Date
    return now >= classDate;
  }
}