import { db } from '../../../shared/config/database.js';
import { Attendance } from '../domain/Attendance.js';

export class AttendanceRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new Attendance({
      idAbsensi: row.id_absensi,
      idUser: row.id_user,
      waktuCheckin: row.waktu_checkin,
      waktuCheckout: row.waktu_checkout,
      statusAkses: row.status_akses,
    });
  }

  // Mencari apakah user sedang berada di dalam gym (waktu_checkout masih NULL)
  async findActiveCheckIn(idUser) {
    const query = `
      SELECT * FROM absensi 
      WHERE id_user = $1 AND waktu_checkout IS NULL AND status_akses = 'Granted'
      ORDER BY waktu_checkin DESC LIMIT 1
    `;
    const result = await db.query(query, [idUser]);
    return this._mapToDomain(result.rows[0]);
  }

  async createCheckIn(idUser, statusAkses) {
    const query = `
      INSERT INTO absensi (id_user, status_akses)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await db.query(query, [idUser, statusAkses]);
    return this._mapToDomain(result.rows[0]);
  }

  async updateCheckOut(idAbsensi) {
    const query = `
      UPDATE absensi 
      SET waktu_checkout = NOW() 
      WHERE id_absensi = $1 
      RETURNING *
    `;
    const result = await db.query(query, [idAbsensi]);
    return this._mapToDomain(result.rows[0]);
  }
}