import cron from 'node-cron';
import { db } from '../shared/config/database.js';

export const startClassCron = () => {
  // Berjalan setiap jam pada menit ke-0 (misal: 13:00, 14:00, dst)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Menjalankan pembersihan kelas yang waktu pelaksanaannya telah selesai...');
    
    // Menggunakan pool koneksi dari database config
    let client;
    try {
      // db diekspor sebagai wrapper { query, getClient }, bukan Pool langsung
      client = await db.getClient();
      await client.query('BEGIN');

      // PENTING: constraint booking_kelas_id_kelas_fkey TIDAK memakai ON DELETE CASCADE
      // (lihat skema DB), jadi baris booking_kelas terkait harus dihapus dulu secara
      // eksplisit, kalau tidak DELETE FROM kelas akan gagal dengan foreign key violation
      // setiap kali kelas yang sudah selesai masih punya booking.
      const deleteBookingRes = await client.query(`
        DELETE FROM booking_kelas
        WHERE id_kelas IN (
          SELECT id_kelas FROM kelas WHERE waktu_selesai < NOW()
        )
      `);

      // HARD DELETE kelas yang waktu pelaksanaannya sudah lewat dari waktu sekarang
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
      if (client) client.release(); // Mengembalikan koneksi ke pool
    }
  }, {
    timezone: 'Asia/Jakarta' // konsisten dengan membershipCron, meski job ini per-jam
  });

  console.log('[CRON] Class cleanup cron terdaftar: setiap jam (Asia/Jakarta).');
};