// src/modules/notifications/infrastructure/notification.repository.js
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

  async findByUserId(idUser) {
    const query = `
      SELECT * FROM notifications 
      WHERE id_user = $1 
      ORDER BY waktu_dikirim DESC
    `;
    const result = await db.query(query, [idUser]);
    return result.rows.map(row => this._mapToDomain(row));
  }

  async findAll() {
    const query = `
      SELECT * FROM notifications 
      ORDER BY waktu_dikirim DESC
    `;
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row));
  }

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
  
  async createSystemNotification(idUser, judul, pesan) {
    const query = `
      INSERT INTO notifications (id_user, judul, pesan, status_baca)
      VALUES ($1, $2, $3, 0)
      RETURNING *
    `;
    const result = await db.query(query, [idUser, judul, pesan]);
    return this._mapToDomain(result.rows[0]);
  }

  async saveMany(notifications) {
    if (!notifications || notifications.length === 0) return [];
    
    const values = notifications.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(', ');
    const flatParams = notifications.flatMap(n => [n.id_user, n.judul, n.pesan, n.status_baca]);
    
    const query = `
      INSERT INTO notifications (id_user, judul, pesan, status_baca)
      VALUES ${values}
      RETURNING *
    `;
    
    const result = await db.query(query, flatParams);
    return result.rows.map(row => this._mapToDomain(row));
  }
  
  async deleteByIdAndUserId(idNotifikasi, idUser) {
    const query = `
      DELETE FROM notifications 
      WHERE id_notifikasi = $1 AND id_user = $2
      RETURNING *;
    `;
    const result = await db.query(query, [idNotifikasi, idUser]);
    return result.rowCount > 0; 
  }

  async deleteById(idNotifikasi) {
    const query = `
      DELETE FROM notifications 
      WHERE id_notifikasi = $1
      RETURNING *;
    `;
    const result = await db.query(query, [idNotifikasi]);
    return result.rowCount > 0;
  }
}