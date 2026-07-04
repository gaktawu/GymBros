import app from './app.js';
import { db } from './shared/config/database.js';
import { startMembershipCron } from './cron/membershipCron.js';
import { startClassCron } from './cron/classCron.js'; // 1. Import class cron baru

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const res = await db.query('SELECT NOW() AS current_time');
    console.log(` Database connected successfully! Server time: ${res.rows[0].current_time}`);

    // Jalankan semua background service cron job
    startMembershipCron();
    startClassCron(); // 2. Eksekusi scheduler kelas di sini

    app.listen(PORT, () => {
      console.log(` GymBros Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();