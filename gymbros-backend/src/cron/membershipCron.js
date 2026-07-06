import cron from 'node-cron';
import { db } from '../shared/config/database.js';

export const startMembershipCron = () => {
  //setiap jam 00.00
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Menjalankan pembersihan membership user yang sudah expired...');

    let client;
    try {

      client = await db.getClient();
      await client.query('BEGIN');

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
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[CRON ERROR] Gagal rollback:', rollbackError.message);
        }
      }
      console.error('[CRON ERROR] Gagal menjalankan pembersihan membership:', error);
    } finally {
      if (client) client.release(); 
    }
  }, {
    timezone: 'Asia/Jakarta' 
  });

  console.log('[CRON] Membership cleanup cron terdaftar: setiap hari 00:00 (Asia/Jakarta).');
};