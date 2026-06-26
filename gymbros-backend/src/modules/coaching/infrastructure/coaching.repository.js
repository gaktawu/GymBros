import { db } from '../../../shared/config/database.js';
import { PaketCoaching } from '../domain/PaketCoaching.js';
import { SesiCoach } from '../domain/SesiCoach.js';

export class CoachingRepository {
  _mapPaketToDomain(row) {
    if (!row) return null;
    return new PaketCoaching({
      idPaketCoaching: row.id_paket_coaching,
      idPayment: row.id_payment,
      idMember: row.id_member,
      idCoach: row.id_coach,
      totalSesi: row.total_sesi,
      sisaSesi: row.sisa_sesi,
      statusPaket: row.status_paket,
    });
  }

  _mapSesiToDomain(row) {
    if (!row) return null;
    return new SesiCoach({
      idSesi: row.id_sesi,
      idCoach: row.id_coach,
      tanggalSesi: row.tanggal_sesi,
      waktuMulai: row.waktu_mulai,
      waktuSelesai: row.waktu_selesai,
      idPaketCoaching: row.id_paket_coaching,
      statusKehadiran: row.status_kehadiran,
    });
  }

  // COACH: Membuat slot jadwal luang
  async createSession(idCoach, { tanggalSesi, waktuMulai, waktuSelesai }) {
    const query = `
      INSERT INTO sesi_coach (id_coach, tanggal_sesi, waktu_mulai, waktu_selesai, status_kehadiran)
      VALUES ($1, $2, $3, $4, 'Tersedia')
      RETURNING *
    `;
    const result = await db.query(query, [idCoach, tanggalSesi, waktuMulai, waktuSelesai]);
    return this._mapSesiToDomain(result.rows[0]);
  }

  async findSessionById(idSesi) {
    const query = `SELECT * FROM sesi_coach WHERE id_sesi = $1`;
    const result = await db.query(query, [idSesi]);
    return this._mapSesiToDomain(result.rows[0]);
  }

  // MEMBER: Mencari paket aktif yang dimiliki dengan coach tertentu
  async findActivePackage(idMember, idCoach) {
    const query = `
      SELECT * FROM paket_coaching_member 
      WHERE id_member = $1 AND id_coach = $2 AND status_paket = 'Aktif' AND sisa_sesi > 0
    `;
    const result = await db.query(query, [idMember, idCoach]);
    return this._mapPaketToDomain(result.rows[0]);
  }

  // MEMBER: Membeli paket (Simulasi, karena kita belum buat modul Payment)
  async createPackageMock(idMember, idCoach) {
    // Kita mock id_payment sementara
    const mockIdPayment = `PAY-MOCK-${Date.now()}`;

    // Insert dummy payment dulu agar foreign key lolos
    await db.query(`
      INSERT INTO payments (id_payment, id_user, kategori_transaksi, total_tagihan, total_dibayar, metode, status)
      VALUES ($1, $2, 'Paket_Coaching', 1500000, 1500000, 'Mock_Transfer', 'Lunas')
    `, [mockIdPayment, idMember]);

    const query = `
      INSERT INTO paket_coaching_member (id_payment, id_member, id_coach, total_sesi, sisa_sesi, status_paket)
      VALUES ($1, $2, $3, 10, 10, 'Aktif')
      RETURNING *
    `;
    const result = await db.query(query, [mockIdPayment, idMember, idCoach]);
    return this._mapPaketToDomain(result.rows[0]);
  }

  // TRANSAKSI INTI: Booking Sesi & Potong Kuota secara bersamaan
  async bookSessionTransaction(idSesi, idPaketCoaching) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN'); // Mulai transaksi

      // 1. Update status slot sesi menjadi 'Booked' dan sambungkan ke id_paket
      const updateSesiQuery = `
        UPDATE sesi_coach 
        SET status_kehadiran = 'Booked', id_paket_coaching = $1
        WHERE id_sesi = $2 AND status_kehadiran = 'Tersedia'
        RETURNING *
      `;
      const sesiResult = await client.query(updateSesiQuery, [idPaketCoaching, idSesi]);

      if (sesiResult.rowCount === 0) {
        throw new Error('Sesi tidak tersedia atau sudah dibooking');
      }

      // 2. Kurangi sisa sesi di paket
      const updatePaketQuery = `
        UPDATE paket_coaching_member 
        SET sisa_sesi = sisa_sesi - 1,
            status_paket = CASE WHEN (sisa_sesi - 1) = 0 THEN 'Selesai' ELSE status_paket END
        WHERE id_paket_coaching = $1 AND sisa_sesi > 0
        RETURNING *
      `;
      await client.query(updatePaketQuery, [idPaketCoaching]);

      await client.query('COMMIT'); // Simpan permanen
      return this._mapSesiToDomain(sesiResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK'); // Batalkan semua jika ada error
      throw error;
    } finally {
      client.release(); // Kembalikan koneksi ke pool
    }
  }

  async softDeletePaketCoachingById(id) {
    const query = `
      UPDATE public.paket_coaching_member 
      SET is_deleted = TRUE, deleted_at = NOW() 
      WHERE id_paket_coaching = $1 RETURNING *;
    `;
    return await db.query(query, [id]);
  }
}