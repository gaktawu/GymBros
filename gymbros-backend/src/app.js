import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AppError } from './shared/core/AppError.js';
import { globalErrorHandler } from './shared/middlewares/errorMiddleware.js';

import authRoutes from './modules/auth/presentation/auth.routes.js';
import classRoutes from './modules/classes/presentation/class.routes.js';
import membershipRoutes from './modules/memberships/presentation/membership.routes.js';
import paketMembershipRoutes from './modules/paket-membership/presentation/paketMembership.routes.js';
import classBookingRoutes from './modules/class-bookings/presentation/classBooking.routes.js';
import equipmentRoutes from './modules/equipment/presentation/equipment.routes.js';
import attendanceRoutes from './modules/attendance/presentation/attendance.routes.js';
import coachingRoutes from './modules/coaching/presentation/coaching.routes.js';
import notificationRoutes from './modules/notifications/presentation/notification.routes.js';
import paymentRoutes from './modules/payments/presentation/payment.routes.js';
import reportRoutes from './modules/reports/presentation/report.routes.js';
import userReportRoutes from './modules/user-reports/presentation/userReport.routes.js';
import usersRoutes from './modules/users/presentation/users.routes.js';

const app = express();

// ✅ FIX: CORS configuration yang lebih spesifik
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Parsing body payload (PENTING: Harus diletakkan sebelum mendefinisikan rute agar req.body terbaca)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ PENTING: favicon route diletakkan lebih awal untuk mencegah logging yang tidak perlu
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Middleware Logging untuk Debugging Ngrok & Midtrans
app.use((req, res, next) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log(`Content-Type: ${req.headers['content-type'] || 'N/A'}`);
  
  if (req.method === 'POST' && req.body) {
    // Menampilkan cuplikan order_id dan status jika itu dari webhook midtrans
    if (req.url.includes('webhook')) {
      console.log('Webhook Body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GymBros API is up and running!',
    timestamp: new Date().toISOString()
  });
});

// Registrasi API Routes (v1)
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/paket-membership', paketMembershipRoutes);
app.use('/api/v1/class-bookings', classBookingRoutes);
app.use('/api/v1/equipments', equipmentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/coaching', coachingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payments', paymentRoutes); 
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/user-reports', userReportRoutes);
app.use('/api/v1/users', usersRoutes);

// ✅ FIX: 404 Handler dengan error yang proper
app.use((req, res, next) => {
  const error = new AppError(`Endpoint tidak ditemukan: ${req.originalUrl}`, 404);
  next(error);
});

// ✅ FIX: Centralized Global Error Middleware dengan proper error handling
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  console.error(`\n❌ ERROR [${err.statusCode}]: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;