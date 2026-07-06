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

  async findActiveCheckIn(idUser) {
    const query = `
      SELECT * FROM public.absensi 
      WHERE id_user = $1 AND waktu_checkout IS NULL AND status_akses = 'Granted'
      ORDER BY waktu_checkin DESC LIMIT 1
    `;
    const result = await db.query(query, [idUser]);
    return this._mapToDomain(result.rows[0]);
  }

  async createCheckIn(idUser, statusAkses) {
    const query = `
      INSERT INTO public.absensi (id_user, status_akses)
      VALUES ($1, $2) RETURNING *
    `;
    const result = await db.query(query, [idUser, statusAkses]);
    return this._mapToDomain(result.rows[0]);
  }

  async updateCheckOut(idAbsensi) {
    const query = `
      UPDATE public.absensi 
      SET waktu_checkout = NOW() 
      WHERE id_absensi = $1 RETURNING *
    `;
    const result = await db.query(query, [idAbsensi]);
    return this._mapToDomain(result.rows[0]);
  }

  // Method Tambahan untuk State & Cron
  async countActiveMembers() {
    const query = `SELECT COUNT(*) FROM public.absensi WHERE waktu_checkout IS NULL AND status_akses = 'Granted'`;
    const result = await db.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  async autoCheckOutOverdue(maxHours) {
    const query = `
      UPDATE public.absensi 
      SET waktu_checkout = NOW() 
      WHERE waktu_checkout IS NULL 
      AND waktu_checkin < NOW() - INTERVAL '${maxHours} hours'
    `;
    const result = await db.query(query);
    return result.rowCount;
  }

  async countDistinctCheckInDays(idUser) {
    const query = `
      SELECT COUNT(DISTINCT DATE(waktu_checkin)) as total_days
      FROM public.absensi
      WHERE id_user = $1 AND status_akses = 'Granted'
    `;
    const result = await db.query(query, [idUser]);
    return parseInt(result.rows[0].total_days, 10) || 0;
  }

  // Method Tambahan untuk State & Cron
  async countActiveMembers() {
    const query = `SELECT COUNT(*) FROM public.absensi WHERE waktu_checkout IS NULL AND status_akses = 'Granted'`;
    const result = await db.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}