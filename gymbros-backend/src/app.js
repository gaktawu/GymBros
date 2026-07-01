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

app.use((req, res, next) => {
  console.log('RAW Incoming:', req.method, req.url);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GymBros API is up and running!',
  });
});

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

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
export default app;