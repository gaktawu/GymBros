import express from 'express';
import { CoachingRepository } from '../infrastructure/coaching.repository.js';
import { CoachingUseCase } from '../application/coaching.usecase.js';
import { CoachingController } from './coaching.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { createSessionSchema, buyPackageSchema } from './coaching.validation.js';

const router = express.Router();

const coachingRepo = new CoachingRepository();
const coachingUseCase = new CoachingUseCase(coachingRepo);
const coachingController = new CoachingController(coachingUseCase);

router.use(protect);

// Rute untuk Coach
router.post(
  '/sessions', 
  restrictTo('Coach'), 
  validate(createSessionSchema), 
  asyncHandler(coachingController.createSession)
);

// Rute untuk Member
router.post(
  '/packages', 
  restrictTo('Member'), 
  validate(buyPackageSchema), 
  asyncHandler(coachingController.buyPackage)
);

router.post(
  '/sessions/:idSesi/book', 
  restrictTo('Member'), 
  asyncHandler(coachingController.bookSession)
);

router.delete('/paket/:id', restrictTo('Admin'), asyncHandler(CoachingController.deletePaketCoaching));

export default router;