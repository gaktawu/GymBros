import cron from 'node-cron';
import { MembershipRepository } from '../modules/memberships/infrastructure/membership.repository.js';

export const initMembershipCron = () => {
  // Jalan setiap malam jam 00:00 (Tengah Malam)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Menjalankan Scheduled Delete untuk data Soft-Deleted...');
    
    const client = await db.connect();
    try {
      await client.query('BEGIN'); // Mulai transaksi untuk keamanan

      // 1. HARD DELETE Kelas yang di-soft-delete DAN waktunya sudah lewat
      const deleteKelasQuery = `
        DELETE FROM kelas 
        WHERE is_deleted = true 
        AND waktu_selesai < NOW()
      `;
      const resKelas = await client.query(deleteKelasQuery);
      if (resKelas.rowCount > 0) {
        console.log(`[CRON] Berhasil menghapus permanen ${resKelas.rowCount} jadwal Kelas.`);
      }

      // 2. HARD DELETE Paket Membership yang di-soft-delete 
      // SYARAT: Tidak ada user yang masa aktifnya belum habis menggunakan paket ini
      // Asumsi ada tabel 'user_memberships' (atau semacamnya) yang menyimpan status aktif user
      const deletePaketQuery = `
        DELETE FROM paket_membership pm
        WHERE pm.is_deleted = true
        AND NOT EXISTS (
            SELECT 1 FROM user_memberships um 
            WHERE um.id_paket = pm.id_paket 
            AND um.tanggal_berakhir >= NOW()
            AND um.status = 'Aktif'
        )
      `;
      const resPaket = await client.query(deletePaketQuery);
      if (resPaket.rowCount > 0) {
         console.log(`[CRON] Berhasil menghapus permanen ${resPaket.rowCount} Paket Membership.`);
      }

      // 3. (Opsional) ANONYMIZATION / Hapus Coach yang Nonaktif jika tidak ada kelas mendatang
      const deleteCoachQuery = `
        UPDATE users 
        SET nama_lengkap = 'Deleted Coach', email = concat('deleted-', id_user, '@gym.com'), no_telepon = NULL
        WHERE peran = 'Coach' 
        AND status_akun = 'Nonaktif'
        AND NOT EXISTS (
           SELECT 1 FROM kelas k WHERE k.id_pelatih = users.id_user AND k.waktu_mulai >= NOW()
        )
      `;
      await client.query(deleteCoachQuery);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[CRON ERROR] Gagal menjalankan Scheduled Delete:', error);
    } finally {
      client.release();
    }
  });
};