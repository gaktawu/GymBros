import express from 'express';
// Import Repository lokal dan lintas modul
import { ClassBookingRepository } from '../infrastructure/classBooking.repository.js';
import { MembershipRepository } from '../../memberships/infrastructure/membership.repository.js';
import { ClassRepository } from '../../classes/infrastructure/class.repository.js';

// Import Use Case & Controller
import { ClassBookingUseCase } from '../application/classBooking.usecase.js';
import { ClassBookingController } from './classBooking.controller.js';

// Import Shared/Middlewares
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { bookClassSchema } from './classBooking.validation.js';

const router = express.Router();

// Dependency Injection Setup
const classBookingRepo = new ClassBookingRepository();
const membershipRepo = new MembershipRepository();
const classRepo = new ClassRepository();

const classBookingUseCase = new ClassBookingUseCase(classBookingRepo, membershipRepo, classRepo);
const classBookingController = new ClassBookingController(classBookingUseCase);

// Middleware Proteksi
router.use(protect);

// Hanya Member yang diizinkan mem-booking dan membatalkan
router.post(
  '/', 
  restrictTo('Member'), 
  validate(bookClassSchema), 
  asyncHandler(classBookingController.bookClass)
);

router.patch(
  '/:id/cancel', 
  restrictTo('Member'), 
  asyncHandler(classBookingController.cancelBooking)
);

export default router;