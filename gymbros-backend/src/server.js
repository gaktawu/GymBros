import app from './app.js';
import { db } from './shared/config/database.js';
import { startMembershipCron } from './cron/membershipCron.js';
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const res = await db.query('SELECT NOW() AS current_time');
    console.log(` Database connected successfully! Server time: ${res.rows[0].current_time}`);

    // Jalankan service cron job
    startMembershipCron();

    app.listen(PORT, () => {
      console.log(` GymBros Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();