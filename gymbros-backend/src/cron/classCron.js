import cron from 'node-cron';
import { db } from '../shared/config/database.js';

export const startClassCron = () => {
  // Berjalan setiap jam pada menit ke-0 (misal: 13:00, 14:00, dst)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Menjalankan pembersihan kelas yang waktu pelaksanaannya telah selesai...');
    
    let client;
    try {
      client = await db.getClient();
      await client.query('BEGIN');

      const deleteBookingRes = await client.query(`
        DELETE FROM booking_kelas
        WHERE id_kelas IN (
          SELECT id_kelas FROM kelas WHERE waktu_selesai < NOW()
        )
      `);

      const deleteClassRes = await client.query(`
        DELETE FROM kelas
        WHERE waktu_selesai < NOW()
      `);

      if (deleteClassRes.rowCount > 0) {
        console.log(`[CRON] Berhasil hard delete ${deleteClassRes.rowCount} kelas yang sudah selesai (beserta ${deleteBookingRes.rowCount} booking terkait).`);
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
      console.error('[CRON ERROR] Gagal menghapus kelas otomatis:', error);
    } finally {
      if (client) client.release(); 
    }
  }, {
    timezone: 'Asia/Jakarta' 
  });

  console.log('[CRON] Class cleanup cron terdaftar: setiap jam (Asia/Jakarta).');
};