import express from 'express';
import { EquipmentRepository } from '../infrastructure/equipment.repository.js';
import { EquipmentUseCase } from '../application/equipment.usecase.js';
import { EquipmentController } from './equipment.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { createEquipmentSchema, updateStatusEquipmentSchema } from './equipment.validation.js';

const router = express.Router();

const equipmentRepo = new EquipmentRepository();
const equipmentUseCase = new EquipmentUseCase(equipmentRepo);
const equipmentController = new EquipmentController(equipmentUseCase);

router.use(protect);

// Semua yang login bisa melihat daftar dan status alat
router.get('/', asyncHandler(equipmentController.getAllEquipment));

// Hanya Admin yang bisa menambah alat baru dan mengupdate status kondisinya
router.post(
  '/', 
  restrictTo('Admin'), 
  validate(createEquipmentSchema), 
  asyncHandler(equipmentController.addEquipment)
);

router.patch(
  '/:id/status', 
  restrictTo('Admin'), 
  validate(updateStatusEquipmentSchema), 
  asyncHandler(equipmentController.updateStatus)
);

export default router;