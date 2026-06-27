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
      waktuBooking: row.tanggal_booking, // Sesuaikan dengan nama kolom tabel
    });
  }

  async countActiveBookingsByUser(idUser) {
    const query = `SELECT COUNT(*) FROM booking_kelas WHERE id_user = $1 AND status = 'Booked'`;
    const result = await db.query(query, [idUser]);
    return parseInt(result.rows[0].count, 10);
  }

  async checkExistingBooking(idUser, idKelas) {
    const query = `SELECT * FROM booking_kelas WHERE id_user = $1 AND id_kelas = $2 AND status = 'Booked'`;
    const result = await db.query(query, [idUser, idKelas]);
    return this._mapToDomain(result.rows[0]);
  }

  async countParticipantsInClass(idKelas) {
    const query = `SELECT COUNT(*) FROM booking_kelas WHERE id_kelas = $1 AND status = 'Booked'`;
    const result = await db.query(query, [idKelas]);
    return parseInt(result.rows[0].count, 10);
  }

  async create(idUser, idKelas) {
    const query = `
      INSERT INTO booking_kelas (id_user, id_kelas, status, tanggal_booking)
      VALUES ($1, $2, 'Booked', CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const result = await db.query(query, [idUser, idKelas]);
    return this._mapToDomain(result.rows[0]);
  }

  async cancelBooking(idBooking) {
    const query = `UPDATE booking_kelas SET status = 'Cancelled' WHERE id_booking = $1 RETURNING *`;
    const result = await db.query(query, [idBooking]);
    return this._mapToDomain(result.rows[0]);
  }
}