import express from 'express';
import { MembershipRepository } from '../infrastructure/membership.repository.js';
import { PaketMembershipRepository } from '../../paket-membership/infrastructure/paketMembership.repository.js'; // Import dari modul tetangga
import { MembershipUseCase } from '../application/membership.usecase.js';
import { MembershipController } from './membership.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { subscribeSchema } from './membership.validation.js';
import { NotificationRepository } from '../../notifications/infrastructure/notification.repository.js';
import { NotificationService } from '../../notifications/application/notification.service.js';
import { UsersRepository } from '../../users/infrastructure/users.repository.js';

const router = express.Router();

// 1. Dependency Injection Lintas Modul

const membershipRepository = new MembershipRepository();
const paketMembershipRepository = new PaketMembershipRepository(); 

const userRepo = new UsersRepository();
const notifRepo = new NotificationRepository();
const notifService = new NotificationService(notifRepo, userRepo);

const membershipUseCase = new MembershipUseCase(membershipRepository, paketMembershipRepository);
const membershipController = new MembershipController(membershipUseCase);

// 2. Definisi Rute (Wajib Login)
router.use(protect);

// Endpoint untuk Member: Membeli dan mengecek status
router.post(
  '/subscribe', 
  restrictTo('Member'), // Hanya Member yang bisa beli
  validate(subscribeSchema), 
  asyncHandler(membershipController.subscribe)
);

router.get(
  '/my-active', 
  restrictTo('Member'), 
  asyncHandler(membershipController.getMyMembership)
);

export default router;