import { db } from '../../../shared/config/database.js';
import { Notification } from '../domain/Notification.js';

export class NotificationRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new Notification({
      idNotifikasi: row.id_notifikasi,
      idUser: row.id_user,
      judul: row.judul,
      pesan: row.pesan,
      waktuDikirim: row.waktu_dikirim,
      statusBaca: row.status_baca,
    });
  }

  // Mengambil semua notifikasi milik seorang user, diurutkan dari yang terbaru
  async findByUserId(idUser) {
    const query = `
      SELECT * FROM notifications 
      WHERE id_user = $1 
      ORDER BY waktu_dikirim DESC
    `;
    const result = await db.query(query, [idUser]);
    return result.rows.map(row => this._mapToDomain(row));
  }

  // Mengubah status notifikasi menjadi "Read" (1)
  async markAsRead(idNotifikasi, idUser) {
    const query = `
      UPDATE notifications 
      SET status_baca = 1 
      WHERE id_notifikasi = $1 AND id_user = $2
      RETURNING *
    `;
    const result = await db.query(query, [idNotifikasi, idUser]);
    return this._mapToDomain(result.rows[0]);
  }

  // Method ini bisa dipanggil oleh modul lain (seperti Cron Job atau Class Booking) 
  // untuk mengirimkan notifikasi sistem ke user
  async createSystemNotification(idUser, judul, pesan) {
    const query = `
      INSERT INTO notifications (id_user, judul, pesan, status_baca)
      VALUES ($1, $2, $3, 0)
      RETURNING *
    `;
    const result = await db.query(query, [idUser, judul, pesan]);
    return this._mapToDomain(result.rows[0]);
  }
}