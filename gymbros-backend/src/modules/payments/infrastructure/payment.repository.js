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
    snapToken: row.snap_token,
    redirectUrl: row.redirect_url,
  });
}

  async findById(idPayment, executor = db) {
    const query = `SELECT * FROM payments WHERE id_payment = $1`;
    const result = await executor.query(query, [idPayment]);
    return this._mapToDomain(result.rows[0]);
  }

  async findByUserId(idUser, executor = db) {
    const query = `
      SELECT * FROM payments 
      WHERE id_user = $1 
      ORDER BY waktu_bayar DESC NULLS LAST, id_payment DESC
      LIMIT 50
    `;
    const result = await executor.query(query, [idUser]);
    return result.rows.map(row => this._mapToDomain(row));
  }

  async findActivePendingInvoiceByReference(idUser, prefix, referenceId, executor = db) {
    const query = `
      SELECT * FROM payments
      WHERE id_user = $1 AND status = 'Pending' AND id_payment LIKE $2
      ORDER BY id_payment DESC
      LIMIT 1
    `;
    const pattern = `${prefix}-${referenceId}-${idUser}-%`;
    const result = await executor.query(query, [idUser, pattern]);
    return this._mapToDomain(result.rows[0]);
  }

  async createInvoice({ idPayment, idUser, kategoriTransaksi, totalTagihan, metode }, executor = db) {
    const query = `
      INSERT INTO payments (id_payment, id_user, kategori_transaksi, total_tagihan, total_dibayar, metode, status)
      VALUES ($1, $2, $3, $4, 0.00, $5, 'Pending')
      RETURNING *
    `;
    const result = await executor.query(query, [idPayment, idUser, kategoriTransaksi, totalTagihan, metode]);
    return this._mapToDomain(result.rows[0]);
  }

  async saveSnapToken(idPayment, snapToken, redirectUrl, executor = db) {
    const query = `
      UPDATE payments 
      SET snap_token = $1, redirect_url = $2
      WHERE id_payment = $3
      RETURNING *
    `;
    const result = await executor.query(query, [snapToken, redirectUrl, idPayment]);
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
      SET status = 'Gagal', waktu_bayar = NOW()
      WHERE id_payment = $1 AND status = 'Pending'
      RETURNING *
    `;
    const result = await executor.query(query, [idPayment]);
    return this._mapToDomain(result.rows[0]);
  }

  async getPaketMembershipById(idPaket, executor = db) {
    const query = `
      SELECT id_paket, nama_paket, durasi_hari, harga
      FROM paket_membership
      WHERE id_paket = $1 AND is_deleted = false AND status_aktif = 'Tersedia'
    `;
    const result = await executor.query(query, [idPaket]);
    return result.rows[0] || null;
  }

  async getCoachById(idCoach, executor = db) {
    const query = `
      SELECT id_user, nama_lengkap
      FROM users
      WHERE id_user = $1 AND peran = 'Coach' AND status_akun = 'Aktif'
    `;
    const result = await executor.query(query, [idCoach]);
    return result.rows[0] || null;
  }

  async getKelasById(idKelas, executor = db) {
    const query = `
      SELECT id_kelas, nama_kelas, kapasitas, waktu_mulai, waktu_selesai, harga, status
      FROM kelas
      WHERE id_kelas = $1 AND is_deleted = false
    `;
    const result = await executor.query(query, [idKelas]);
    return result.rows[0] || null;
  }

  async lockKelasForUpdate(idKelas, executor = db) {
    const query = `
      SELECT id_kelas, nama_kelas, kapasitas, waktu_mulai, waktu_selesai, harga, status
      FROM kelas
      WHERE id_kelas = $1 AND is_deleted = false
      FOR UPDATE
    `;
    const result = await executor.query(query, [idKelas]);
    return result.rows[0] || null;
  }

  async countBookingKelasById(idKelas, executor = db) {
    const query = `
      SELECT COUNT(*) as total
      FROM booking_kelas
      WHERE id_kelas = $1 AND status = 'Booked'
    `;
    const result = await executor.query(query, [idKelas]);
    return parseInt(result.rows[0].total, 10);
  }

  async isUserAlreadyBooked(idKelas, idUser, executor = db) {
    const query = `
      SELECT id_booking
      FROM booking_kelas
      WHERE id_kelas = $1 AND id_user = $2 AND status = 'Booked'
      LIMIT 1
    `;
    const result = await executor.query(query, [idKelas, idUser]);
    return !!result.rows[0];
  }

  async isUserBookingOverlap(idUser, waktuMulai, waktuSelesai, executor = db, excludeIdKelas = null) {
    const query = `
      SELECT bk.id_booking
      FROM booking_kelas bk
      INNER JOIN kelas k ON k.id_kelas = bk.id_kelas
      WHERE bk.id_user = $1
        AND bk.status = 'Booked'
        AND k.waktu_mulai < $3
        AND k.waktu_selesai > $2
        ${excludeIdKelas ? 'AND bk.id_kelas <> $4' : ''}
      LIMIT 1
    `;
    const params = excludeIdKelas
      ? [idUser, waktuMulai, waktuSelesai, excludeIdKelas]
      : [idUser, waktuMulai, waktuSelesai];
    const result = await executor.query(query, params);
    return !!result.rows[0];
  }

  async getMembershipByUserId(idUser, executor = db) {
    const query = `SELECT * FROM membership WHERE id_user = $1 LIMIT 1`;
    const result = await executor.query(query, [idUser]);
    return result.rows[0] || null;
  }

  async lockMembershipForUpdate(idUser, executor = db) {
    const query = `SELECT * FROM membership WHERE id_user = $1 FOR UPDATE`;
    const result = await executor.query(query, [idUser]);
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

  async extendMembership({ idMembership, tglMulai, tglBerakhir, status = 'Aktif' }, executor = db) {
    const query = `
      UPDATE membership
      SET tgl_mulai = $1, tgl_berakhir = $2, status = $3
      WHERE id_membership = $4
      RETURNING *
    `;
    const result = await executor.query(query, [tglMulai, tglBerakhir, status, idMembership]);
    return result.rows[0];
  }

  async createBookingKelas({ idKelas, idUser, idPayment }, executor = db) {
    const query = `
      INSERT INTO booking_kelas (id_kelas, id_user, status, waktu_booking, id_payment)
      VALUES ($1, $2, 'Booked', NOW(), $3)
      RETURNING *
    `;
    const result = await executor.query(query, [idKelas, idUser, idPayment]);
    return result.rows[0];
  }

  async createNotification({ idUser, judul, pesan }, executor = db) {
    const query = `
      INSERT INTO notifications (id_user, judul, pesan, waktu_dikirim, status_baca)
      VALUES ($1, $2, $3, NOW(), 0)
      RETURNING *
    `;
    const result = await executor.query(query, [idUser, judul, pesan]);
    return result.rows[0];
  }

  async findAdmins(executor = db) {
    const query = `SELECT id_user FROM users WHERE peran = 'Admin' AND status_akun = 'Aktif'`;
    const result = await executor.query(query);
    return result.rows;
  }

  async runInTransaction(callback) {

    const client = await db.getClient();
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

  async getPaginatedHistory(idUser, search, limit, offset, executor = db) {
    let query = `
      SELECT p.*,
             CASE 
               WHEN p.kategori_transaksi = 'Membership' THEN pm.nama_paket
               WHEN p.kategori_transaksi = 'Kelas' THEN k.nama_kelas
               ELSE 'Transaksi'
             END as nama_item_spesifik
      FROM public.payments p
      LEFT JOIN public.paket_membership pm 
        ON p.kategori_transaksi = 'Membership' 
        AND split_part(p.id_payment, '-', 2) ~ '^[0-9]+$' 
        AND split_part(p.id_payment, '-', 2)::bigint = pm.id_paket
      LEFT JOIN public.kelas k 
        ON p.kategori_transaksi = 'Kelas' 
        AND split_part(p.id_payment, '-', 2) ~ '^[0-9]+$' 
        AND split_part(p.id_payment, '-', 2)::bigint = k.id_kelas
      WHERE p.id_user = $1
    `;
    const params = [idUser];
    let paramIndex = 2;

    if (search) {
      query += ` AND (
        p.id_payment ILIKE $${paramIndex} 
        OR p.status ILIKE $${paramIndex}
        OR pm.nama_paket ILIKE $${paramIndex}
        OR k.nama_kelas ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.waktu_bayar DESC NULLS LAST, p.id_payment DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await executor.query(query, params);
    
    return result.rows.map(row => {
      const domain = this._mapToDomain(row);
      if (domain) {
        domain.namaItemSpesifik = row.nama_item_spesifik;
      }
      return domain;
    });
  }

  async countHistory(idUser, search, executor = db) {
    let query = `
      SELECT COUNT(*) as total 
      FROM public.payments p
      LEFT JOIN public.paket_membership pm 
        ON p.kategori_transaksi = 'Membership' 
        AND split_part(p.id_payment, '-', 2) ~ '^[0-9]+$' 
        AND split_part(p.id_payment, '-', 2)::bigint = pm.id_paket
      LEFT JOIN public.kelas k 
        ON p.kategori_transaksi = 'Kelas' 
        AND split_part(p.id_payment, '-', 2) ~ '^[0-9]+$' 
        AND split_part(p.id_payment, '-', 2)::bigint = k.id_kelas
      WHERE p.id_user = $1
    `;
    const params = [idUser];
    
    if (search) {
      query += ` AND (
        p.id_payment ILIKE $2 
        OR p.status ILIKE $2
        OR pm.nama_paket ILIKE $2
        OR k.nama_kelas ILIKE $2
      )`;
      params.push(`%${search}%`);
    }

    const result = await executor.query(query, params);
    return parseInt(result.rows[0].total, 10);
  }

  async getRevenueStats(executor = db) {
    const query = `
      SELECT 
        COALESCE(SUM(total_dibayar), 0) AS total_revenue,
        COALESCE(SUM(
          CASE 
            WHEN date_trunc('month', waktu_bayar) = date_trunc('month', CURRENT_DATE) 
            AND date_trunc('year', waktu_bayar) = date_trunc('year', CURRENT_DATE)
            THEN total_dibayar 
            ELSE 0 
          END
        ), 0) AS monthly_revenue
      FROM payments
      WHERE status = 'Lunas'
    `;
    const result = await executor.query(query);
    return {
      totalRevenue: parseFloat(result.rows[0].total_revenue),
      monthlyRevenue: parseFloat(result.rows[0].monthly_revenue)
    };
  }
}