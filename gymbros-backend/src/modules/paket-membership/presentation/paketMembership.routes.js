import express from 'express';
import { PaketMembershipRepository } from '../infrastructure/paketMembership.repository.js';
import { PaketMembershipUseCase } from '../application/paketMembership.usecase.js';
import { PaketMembershipController } from './paketMembership.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { createPaketSchema, updateStatusSchema } from './paketMembership.validation.js';

const router = express.Router();

// 1. Instansiasi Object (Dependency Injection)
const paketRepository = new PaketMembershipRepository();
const paketUseCase = new PaketMembershipUseCase(paketRepository);
const paketController = new PaketMembershipController(paketUseCase);

// 2. Definisi Rute
// Semua route di bawah ini mewajibkan pengguna untuk login terlebih dahulu
router.use(protect);

// Semua role (Admin, Coach, Member) bisa melihat daftar paket yang tersedia
router.get('/', asyncHandler(paketController.getAllPaket));

// Hanya Admin yang bisa membuat paket baru dan mengubah status paket
router.post(
  '/', 
  restrictTo('Admin'), 
  validate(createPaketSchema), 
  asyncHandler(paketController.createPaket)
);

router.patch(
  '/:id/status', 
  restrictTo('Admin'), 
  validate(updateStatusSchema), 
  asyncHandler(paketController.updateStatus)
);

export default router;