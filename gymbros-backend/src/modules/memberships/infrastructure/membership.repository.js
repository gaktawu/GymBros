import { db } from '../../../shared/config/database.js';
import { Membership } from '../domain/Membership.js';

export class MembershipRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new Membership({
      idMembership: row.id_membership,
      idUser: row.id_user,
      idPaket: row.id_paket,
      tglMulai: row.tgl_mulai,
      tglBerakhir: row.tgl_berakhir,
      status: row.status,
      dibuatPada: row.dibuat_pada,
    });
  }

  async findActiveByUserId(idUser) {
    const query = `
      SELECT * FROM user_memberships 
      WHERE id_user = $1 AND tanggal_berakhir >= NOW() AND status = 'Aktif';
    `;
    const result = await db.query(query, [idUser]);
    return this._mapToDomain(result.rows[0]);
  }

  async create(data) {
    const { idUser, idPaket, tglMulai, tglBerakhir, status } = data;
    const query = `
      INSERT INTO membership (id_user, id_paket, tgl_mulai, tgl_berakhir, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [idUser, idPaket, tglMulai, tglBerakhir, status];
    const result = await db.query(query, values);
    return this._mapToDomain(result.rows[0]);
  }

  async updateStatusExpired() {
    // Query optimasi: Langsung update status menjadi 'Expired' untuk semua membership 
    // yang tgl_berakhir-nya sudah lewat dari waktu saat ini (NOW()) dan statusnya masih 'Aktif'.
    const query = `
      UPDATE membership 
      SET status = 'Expired' 
      WHERE status = 'Aktif' AND tgl_berakhir <= NOW()
      RETURNING *
    `;
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row));
  }

  async softDelete(idMembership) {
    const query = `
    UPDATE user_memberships 
    SET is_deleted = true, deleted_at = NOW()
    WHERE id_membership = $1
    RETURNING *
  `;
    const result = await db.query(query, [idMembership]);
    return result.rows[0];
  }

  async findById(idMembership) {
    const query = `SELECT * FROM user_memberships WHERE id_membership = $1`;
    const result = await db.query(query, [idMembership]);
    return result.rows[0];
  }
}