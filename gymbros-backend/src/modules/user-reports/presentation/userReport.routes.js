// presentation/userReport.routes.js
import express from 'express';
import { UserReportRepository } from '../infrastructure/userReport.repository.js';
import { UserReportUseCase } from '../application/userReport.usecase.js';
import { UserReportController } from './userReport.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { createReportSchema, updateReportSchema, updateStatusSchema } from './userReport.validation.js';

const router = express.Router();
const repo = new UserReportRepository();
const useCase = new UserReportUseCase(repo);
const controller = new UserReportController(useCase);

router.use(protect);

// MEMBER ROUTES
router.post('/', restrictTo('Member'), validate(createReportSchema), asyncHandler(controller.submitReport));
router.get('/', restrictTo('Member'), asyncHandler(controller.getMemberReports));
router.get('/:id', restrictTo('Member', 'Admin'), asyncHandler(controller.getReportDetail));
router.put('/:id', restrictTo('Member'), validate(updateReportSchema), asyncHandler(controller.editReport));
router.delete('/:id', restrictTo('Member'), asyncHandler(controller.deleteReport));

// ADMIN ROUTES
router.get('/admin/dashboard', restrictTo('Admin'), asyncHandler(controller.getAdminDashboard));
router.patch('/admin/:id/status', restrictTo('Admin'), validate(updateStatusSchema), asyncHandler(controller.updateStatus));
router.delete('/admin/:id', restrictTo('Admin'), asyncHandler(controller.deleteReport));

export default router;