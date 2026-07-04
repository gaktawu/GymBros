import cron from 'node-cron';
import { db } from '../shared/config/database.js';

export const startMembershipCron = () => {
  // Jalan setiap hari jam 00:00 WIB
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Menjalankan pembersihan membership user yang sudah expired...');

    let client;
    try {
      // db diekspor sebagai wrapper { query, getClient } dari shared/config/database.js
      // getClient() mengembalikan pool.connect(), bukan db.connect() (db bukan Pool langsung)
      client = await db.getClient();
      await client.query('BEGIN');

      // ============================================
      // 1. UPDATE STATUS: membership yang sudah lewat tgl_berakhir → 'Expired'
      //    (Nama tabel diubah ke 'membership', kolom ke 'tgl_berakhir')
      // ============================================
      const expireRes = await client.query(`
        UPDATE membership 
        SET status = 'Expired' 
        WHERE tgl_berakhir < NOW() 
        AND status = 'Aktif'
        RETURNING id_membership
      `);
      if (expireRes.rowCount > 0) {
        console.log(`[CRON] ${expireRes.rowCount} membership user diubah jadi Expired.`);
      }

      // ============================================
      // 2. HARD DELETE: Membership yang masa aktifnya telah habis (Expired)
      //    Langsung dihapus karena database menggunakan ON DELETE CASCADE
      // ============================================
      const deleteRes = await client.query(`
        DELETE FROM membership
        WHERE tgl_berakhir < NOW()
        RETURNING id_membership, id_user, id_paket
      `);

      if (deleteRes.rowCount > 0) {
        console.log(`[CRON] Berhasil hard delete ${deleteRes.rowCount} riwayat transaksi membership yang sudah expired.`);
        deleteRes.rows.forEach(row => {
          console.log(`  - Membership ID: ${row.id_membership}, User: ${row.id_user}, Paket: ${row.id_paket}`);
        });
      }

      // ============================================
      // 3. HARD DELETE: paket_membership yang sudah soft-delete DAN tidak dirujuk lagi
      //    (Nama tabel relasi diubah ke 'membership')
      // ============================================
      const deletePaketRes = await client.query(`
        DELETE FROM paket_membership pm
        WHERE pm.is_deleted = true
        AND NOT EXISTS (
            SELECT 1 FROM membership m 
            WHERE m.id_paket = pm.id_paket
        )
      `);

      if (deletePaketRes.rowCount > 0) {
        console.log(`[CRON] Berhasil hard delete ${deletePaketRes.rowCount} paket membership yang sudah tidak terpakai.`);
      }

      await client.query('COMMIT');
    } catch (error) {
      // client bisa jadi undefined jika db.connect() sendiri yang gagal
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[CRON ERROR] Gagal rollback:', rollbackError.message);
        }
      }
      console.error('[CRON ERROR] Gagal menjalankan pembersihan membership:', error);
    } finally {
      if (client) client.release(); // Mengembalikan koneksi ke pool
    }
  }, {
    timezone: 'Asia/Jakarta' // pastikan jam 00:00 mengacu ke WIB, bukan timezone server
  });

  console.log('[CRON] Membership cleanup cron terdaftar: setiap hari 00:00 (Asia/Jakarta).');
};