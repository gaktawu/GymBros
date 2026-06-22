import express from 'express';
import { UserReportRepository } from '../infrastructure/userReport.repository.js';
import { UserReportUseCase } from '../application/userReport.usecase.js';
import { UserReportController } from './userReport.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { createReportSchema } from './userReport.validation.js';

const router = express.Router();
const repo = new UserReportRepository();
const useCase = new UserReportUseCase(repo);
const controller = new UserReportController(useCase);

router.use(protect);

// Member/Coach mengirim tiket keluhan operasional gym
router.post('/', validate(createReportSchema), asyncHandler(controller.submitReport));

// Admin membaca semua laporan masuk
router.get('/', restrictTo('Admin'), asyncHandler(controller.getAllReports));

export default router;