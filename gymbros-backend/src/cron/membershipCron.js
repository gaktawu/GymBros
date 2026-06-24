import cron from 'node-cron';
import { MembershipRepository } from '../modules/memberships/infrastructure/membership.repository.js';

export const startMembershipCron = () => {
  const membershipRepository = new MembershipRepository();

  // Menjadwalkan tugas untuk berjalan setiap hari pada jam 00:01 tengah malam
  // Format cron: 'menit jam tanggal bulan hari'
  cron.schedule('1 0 * * *', async () => {
    console.log('[CRON] Menjalankan pengecekan membership expired...');
    try {
      const updatedMemberships = await membershipRepository.updateStatusExpired();
      console.log(` [CRON] Selesai. Total membership yang di-set menjadi Expired: ${updatedMemberships.length}`);
    } catch (error) {
      console.error(' [CRON] Gagal memperbarui status membership:', error);
    }
  });

  console.log(' Membership Cron Job initialized.');
};