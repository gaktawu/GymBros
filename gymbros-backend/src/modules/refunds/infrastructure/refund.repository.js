import { db } from '../../../shared/config/database.js';
import { Refund } from '../domain/Refund.js';

export class RefundRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new Refund({
      idRefund: row.id_refund,
      idPayment: row.id_payment,
      idSesi: row.id_sesi,
      totalAwal: row.total_awal,
      potonganDenda: row.potongan_denda,
      jumlahRefund: row.jumlah_refund,
      informasiRekening: row.informasi_rekening,
      statusRefund: row.status_refund,
      waktuPengajuan: row.waktu_pengajuan,
    });
  }

  async create(data) {
    const { idPayment, idSesi, totalAwal, potonganDenda, jumlahRefund, informasiRekening } = data;
    const query = `
      INSERT INTO refunds (id_payment, id_sesi, total_awal, potongan_denda, jumlah_refund, informasi_rekening)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await db.query(query, [idPayment, idSesi, totalAwal, potonganDenda, jumlahRefund, informasiRekening]);
    return this._mapToDomain(result.rows[0]);
  }

  async findPendingRefunds() {
    const query = `SELECT * FROM refunds WHERE status_refund = 'Pending' ORDER BY waktu_pengajuan ASC`;
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row));
  }

  async updateStatusToSuccess(idRefund) {
    const query = `
      UPDATE refunds 
      SET status_refund = 'Success' 
      WHERE id_refund = $1 
      RETURNING *
    `;
    const result = await db.query(query, [idRefund]);
    return this._mapToDomain(result.rows[0]);
  }
}