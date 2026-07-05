import app from './app.js';
import { db } from './shared/config/database.js';
import { startMembershipCron } from './cron/membershipCron.js';
import { startClassCron } from './cron/classCron.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Cek koneksi database terlebih dahulu
    const res = await db.query('SELECT NOW() AS current_time');
    console.log(`Database connected successfully! Server time: ${res.rows[0].current_time}`);

    // 2. Jalankan semua background service cron job
    startMembershipCron();
    startClassCron();

    // 3. Nyalakan server Express (Cukup SATU KALI saja di sini, lengkap dengan '0.0.0.0')
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`GymBros Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();