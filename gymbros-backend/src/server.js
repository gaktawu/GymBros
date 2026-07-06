import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { db } from './shared/config/database.js';
import cron from 'node-cron';

import { startMembershipCron } from './cron/membershipCron.js';
import { startClassCron } from './cron/classCron.js';
import { startAttendanceCron } from './cron/attendanceCron.js';

import { AttendanceRepository } from './modules/attendance/infrastructure/attendance.repository.js';
import { gymState } from './modules/attendance/infrastructure/gym.state.js';
import { registerAttendanceSocket } from './modules/attendance/presentation/attendance.socket.js';

cron.schedule('*/10 * * * *', async () => {
  console.log('[Cron] Running expireStaleReservedBookings...');
  try {
    // Panggil langsung use case atau hit internal endpoint
    await paymentUseCase.expireStaleReservedBookings();
  } catch (err) {
    console.error('[Cron Error]', err.message);
  }
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000
});

app.set('io', io);

registerAttendanceSocket(io);
app.set('attendanceNamespace', io.of('/attendance'));

const startServer = async () => {
  try {
    await db.query('SELECT NOW()');
    console.log('✅ Database connected');

    const repo = new AttendanceRepository();
    const count = await repo.countActiveMembers();
    gymState.syncCount(count);
    console.log(`✅ Gym state synced. Active members: ${count}`);

    gymState.startAutoGenerate(io);
    console.log('✅ Dynamic code auto-generate started');

    startMembershipCron();
    startClassCron();
    startAttendanceCron();
    console.log('✅ All cron jobs started');

    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🚀 Server & WebSockets running        ║
║  📍 Port: ${PORT}                          ║
║  🔗 WebSocket: ws://localhost:${PORT}    ║
║  📡 Namespace: /attendance              ║
╚════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();