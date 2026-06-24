import express from 'express';
import { ReportRepository } from '../infrastructure/report.repository.js';
import { ReportUseCase } from '../application/report.usecase.js';
import { ReportController } from './report.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';

const router = express.Router();

const reportRepo = new ReportRepository();
const reportUseCase = new ReportUseCase(reportRepo);
const reportController = new ReportController(reportUseCase);

// Middleware Proteksi
router.use(protect);

// Keamanan Tingkat Tinggi: Hanya 'Admin' yang memiliki otoritas melihat metrik bisnis
router.get('/dashboard', restrictTo('Admin'), asyncHandler(reportController.getDashboardMetrics));

export default router;