import express from 'express';
import { RefundRepository } from '../infrastructure/refund.repository.js';
import { RefundUseCase } from '../application/refund.usecase.js';
import { RefundController } from './refund.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { createRefundSchema } from './refund.validation.js';

const router = express.Router();
const repo = new RefundRepository();
const useCase = new RefundUseCase(repo);
const controller = new RefundController(useCase);

router.use(protect);

// Member mengajukan refund saat sesi dibatalkan
router.post('/', restrictTo('Member'), validate(createRefundSchema), asyncHandler(controller.requestRefund));

// Admin mengelola antrean grid refund
router.get('/queue', restrictTo('Admin'), asyncHandler(controller.getQueue));
router.patch('/:id/approve', restrictTo('Admin'), asyncHandler(controller.approve));

export default router;