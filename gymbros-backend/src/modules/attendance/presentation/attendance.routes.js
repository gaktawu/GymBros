import express from 'express';
// Import repositori lokal dan lintas modul
import { AttendanceRepository } from '../infrastructure/attendance.repository.js';
import { MembershipRepository } from '../../memberships/infrastructure/membership.repository.js';

import { AttendanceUseCase } from '../application/attendance.usecase.js';
import { AttendanceController } from './attendance.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';

const router = express.Router();

// Dependency Injection Setup
const attendanceRepo = new AttendanceRepository();
const membershipRepo = new MembershipRepository();

const attendanceUseCase = new AttendanceUseCase(attendanceRepo, membershipRepo);
const attendanceController = new AttendanceController(attendanceUseCase);

// Rute ini mewajibkan pengguna login (atau scan QR yang berisi token user)
router.use(protect);

// Endpoint Check-In dan Check-Out untuk Member
router.post('/checkin', restrictTo('Member'), asyncHandler(attendanceController.checkIn));
router.post('/checkout', restrictTo('Member'), asyncHandler(attendanceController.checkOut));

export default router;