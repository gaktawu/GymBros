import { db } from '../../../shared/config/database.js';
import { Payment } from '../domain/Payment.js';

export class PaymentRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new Payment({
      idPayment: row.id_payment,
      idUser: row.id_user,
      kategoriTransaksi: row.kategori_transaksi,
      totalTagihan: row.total_tagihan,
      totalDibayar: row.total_dibayar,
      metode: row.metode,
      status: row.status,
      waktuBayar: row.waktu_bayar,
    });
  }

  async findById(idPayment, executor = db) {
    const query = `SELECT * FROM payments WHERE id_payment = $1`;
    const result = await executor.query(query, [idPayment]);
    return this._mapToDomain(result.rows[0]);
  }

  async createInvoice({ idPayment, idUser, kategoriTransaksi, totalTagihan, metode }) {
    const query = `
      INSERT INTO payments (id_payment, id_user, kategori_transaksi, total_tagihan, total_dibayar, metode, status)
      VALUES ($1, $2, $3, $4, 0.00, $5, 'Pending')
      RETURNING *
    `;
    const result = await db.query(query, [idPayment, idUser, kategoriTransaksi, totalTagihan, metode]);
    return this._mapToDomain(result.rows[0]);
  }

  async markAsPaid(idPayment, totalDibayar, executor = db) {
    const query = `
      UPDATE payments
      SET status = 'Lunas', total_dibayar = $1, waktu_bayar = NOW()
      WHERE id_payment = $2 AND status = 'Pending'
      RETURNING *
    `;
    const result = await executor.query(query, [totalDibayar, idPayment]);
    return this._mapToDomain(result.rows[0]);
  }

  async markAsFailed(idPayment, executor = db) {
    const query = `
      UPDATE payments
      SET status = 'Gagal'
      WHERE id_payment = $1 AND status = 'Pending'
      RETURNING *
    `;
    const result = await executor.query(query, [idPayment]);
    return this._mapToDomain(result.rows[0]);
  }

  // --- Harga SELALU diambil dari sini, tidak pernah dari body request client ---
  async getPaketMembershipById(idPaket) {
    const query = `
      SELECT id_paket, nama_paket, durasi_hari, harga
      FROM paket_membership
      WHERE id_paket = $1 AND is_deleted = false AND status_aktif = 'Tersedia'
    `;
    const result = await db.query(query, [idPaket]);
    return result.rows[0] || null;
  }

  async getCoachById(idCoach) {
    const query = `
      SELECT id_user, nama_lengkap
      FROM users
      WHERE id_user = $1 AND peran = 'Coach' AND status_akun = 'Aktif'
    `;
    const result = await db.query(query, [idCoach]);
    return result.rows[0] || null;
  }

  async createMembership({ idUser, idPaket, tglMulai, tglBerakhir, status = 'Aktif' }, executor = db) {
    const query = `
      INSERT INTO membership (id_user, id_paket, tgl_mulai, tgl_berakhir, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await executor.query(query, [idUser, idPaket, tglMulai, tglBerakhir, status]);
    return result.rows[0];
  }

  async createPaketCoachingMember({ idPayment, idMember, idCoach, totalSesi }, executor = db) {
    const query = `
      INSERT INTO paket_coaching_member (id_payment, id_member, id_coach, total_sesi, sisa_sesi, status_paket)
      VALUES ($1, $2, $3, $4, $4, 'Aktif')
      RETURNING *
    `;
    const result = await executor.query(query, [idPayment, idMember, idCoach, totalSesi]);
    return result.rows[0];
  }

  async runInTransaction(callback) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}