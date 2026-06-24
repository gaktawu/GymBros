import { db } from '../../../shared/config/database.js';
import { ClassBooking } from '../domain/ClassBooking.js';

export class ClassBookingRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new ClassBooking({
      idBooking: row.id_booking,
      idKelas: row.id_kelas,
      idUser: row.id_user,
      status: row.status,
      waktuBooking: row.waktu_booking,
    });
  }

  // Menghitung jumlah booking aktif dari seorang member (Maks 3 aturan)
  async countActiveBookingsByUser(idUser) {
    const query = `SELECT COUNT(*) FROM booking_kelas WHERE id_user = $1 AND status = 'Booked'`;
    const result = await db.query(query, [idUser]);
    return parseInt(result.rows[0].count, 10);
  }

  // Mengecek apakah member sudah mem-booking kelas ini (Cegah double booking)
  async checkExistingBooking(idUser, idKelas) {
    const query = `SELECT * FROM booking_kelas WHERE id_user = $1 AND id_kelas = $2 AND status = 'Booked'`;
    const result = await db.query(query, [idUser, idKelas]);
    return this._mapToDomain(result.rows[0]);
  }

  // Menghitung jumlah orang yang sudah booking kelas ini (Cegah overcapacity)
  async countParticipantsInClass(idKelas) {
    const query = `SELECT COUNT(*) FROM booking_kelas WHERE id_kelas = $1 AND status = 'Booked'`;
    const result = await db.query(query, [idKelas]);
    return parseInt(result.rows[0].count, 10);
  }

  // Mendapatkan detail booking beserta info kelas (untuk validasi waktu pembatalan)
  async findBookingWithClassDetails(idBooking) {
    const query = `
      SELECT b.*, k.waktu_mulai 
      FROM booking_kelas b
      JOIN kelas k ON b.id_kelas = k.id_kelas
      WHERE b.id_booking = $1
    `;
    const result = await db.query(query, [idBooking]);
    return result.rows[0]; // Mengembalikan raw object karena kita butuh join data
  }

  // Membuat booking baru
  async create(idUser, idKelas) {
    const query = `
      INSERT INTO booking_kelas (id_user, id_kelas, status)
      VALUES ($1, $2, 'Booked')
      RETURNING *
    `;
    const result = await db.query(query, [idUser, idKelas]);
    return this._mapToDomain(result.rows[0]);
  }

  // Membatalkan booking
  async cancelBooking(idBooking) {
    const query = `
      UPDATE booking_kelas 
      SET status = 'Cancelled' 
      WHERE id_booking = $1 
      RETURNING *
    `;
    const result = await db.query(query, [idBooking]);
    return this._mapToDomain(result.rows[0]);
  }
}