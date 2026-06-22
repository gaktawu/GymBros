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

  async findById(idPayment) {
    const query = `SELECT * FROM payments WHERE id_payment = $1`;
    const result = await db.query(query, [idPayment]);
    return this._mapToDomain(result.rows[0]);
  }

  async createInvoice(data) {
    const { idUser, kategoriTransaksi, totalTagihan, metode } = data;
    // Generate Invoice ID sederhana: INV-timestamp-userId
    const idPayment = `INV-${Date.now()}-${idUser}`;

    const query = `
      INSERT INTO payments (id_payment, id_user, kategori_transaksi, total_tagihan, total_dibayar, metode, status)
      VALUES ($1, $2, $3, $4, 0.00, $5, 'Pending')
      RETURNING *
    `;
    const result = await db.query(query, [idPayment, idUser, kategoriTransaksi, totalTagihan, metode]);
    return this._mapToDomain(result.rows[0]);
  }

  async processPaymentSuccess(idPayment, totalDibayar) {
    const query = `
      UPDATE payments 
      SET status = 'Lunas', total_dibayar = $1, waktu_bayar = NOW()
      WHERE id_payment = $2 AND status = 'Pending'
      RETURNING *
    `;
    const result = await db.query(query, [totalDibayar, idPayment]);
    return this._mapToDomain(result.rows[0]);
  }
}