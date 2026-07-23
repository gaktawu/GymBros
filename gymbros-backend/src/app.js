import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AppError } from './shared/core/AppError.js';
import { globalErrorHandler } from './shared/middlewares/errorMiddleware.js';

import authRoutes from './modules/auth/presentation/auth.routes.js';
import classRoutes from './modules/classes/presentation/class.routes.js';
import membershipRoutes from './modules/memberships/presentation/membership.routes.js';
import paketMembershipRoutes from './modules/paket-membership/presentation/paketMembership.routes.js';
// import classBookingRoutes from './modules/class-bookings/presentation/classBooking.routes.js';
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
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti Postman, mobile app, atau server-to-server)
    if (!origin) return callback(null, true);

    // Izinkan semua domain dari Railway (.railway.app) DAN localhost
    if (
      origin.includes('.railway.app') || 
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') ||
      origin === process.env.FRONTEND_URL
    ) {
      callback(null, true);
    } else {
      callback(new Error('Dibloker oleh kebijakan CORS GymBros'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // ✅ FIX: Tambahkan header umum yang sering dipakai browser/Vite agar lolos Preflight
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use((req, res, next) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log(`Content-Type: ${req.headers['content-type'] || 'N/A'}`);
  
  if (req.method === 'POST' && req.body) {
    if (req.url.includes('webhook')) {
      console.log('Webhook Body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

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
// app.use('/api/v1/class-bookings', classBookingRoutes);
app.use('/api/v1/equipments', equipmentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/coaching', coachingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payments', paymentRoutes); 
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/user-reports', userReportRoutes);
app.use('/api/v1/users', usersRoutes);

app.use((req, res, next) => {
  const error = new AppError(`Endpoint tidak ditemukan: ${req.originalUrl}`, 404);
  next(error);
});

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