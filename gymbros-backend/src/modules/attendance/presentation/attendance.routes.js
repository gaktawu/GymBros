import express from 'express';
import { AttendanceRepository } from '../infrastructure/attendance.repository.js';
import { MembershipRepository } from '../../memberships/infrastructure/membership.repository.js';
import { AttendanceUseCase } from '../application/attendance.usecase.js';
import { AttendanceController } from './attendance.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';

const router = express.Router();

const attendanceRepo = new AttendanceRepository();
const membershipRepo = new MembershipRepository();
const attendanceUseCase = new AttendanceUseCase(attendanceRepo, membershipRepo);
const attendanceController = new AttendanceController(attendanceUseCase);

router.use(protect);
router.post('/redeem', restrictTo('Member'), asyncHandler(attendanceController.redeemCode));
router.get('/stats', restrictTo('Member'), asyncHandler(attendanceController.getAttendanceStats)); 

router.post('/generate-code', restrictTo('Admin'), asyncHandler(attendanceController.manualGenerateCode));

export default router;