import cron from 'node-cron';
import { MembershipRepository } from '../modules/memberships/infrastructure/membership.repository.js';

const membershipRepo = new MembershipRepository();

export const startMembershipCron = () => {
  // Jalan setiap hari jam 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Menjalankan pembersihan membership user yang sudah expired...');
    
    // Menggunakan pool.connect() karena db di shared config biasanya berupa pg Pool
    const client = await db.connect(); 
    try {
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
      // 2. HARD DELETE: Membership yang sudah 'Expired' lama (Misal: Lebih dari 30 hari)
      //    (Disesuaikan karena tabel membership TIDAK punya kolom is_deleted)
      // ============================================
      const deleteRes = await client.query(`
        DELETE FROM membership
        WHERE status = 'Expired'
        AND tgl_berakhir < NOW() - INTERVAL '30 days'
        RETURNING id_membership, id_user, id_paket
      `);
      
      if (deleteRes.rowCount > 0) {
        console.log(`[CRON] Berhasil hard delete ${deleteRes.rowCount} riwayat membership yang sudah expired > 30 hari.`);
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
      await client.query('ROLLBACK');
      console.error('[CRON ERROR] Gagal:', error);
    } finally {
      client.release(); // Mengembalikan koneksi ke pool
    }
  });
};