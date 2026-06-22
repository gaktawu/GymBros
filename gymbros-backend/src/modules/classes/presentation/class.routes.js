import express from 'express';
import { ClassRepository } from '../infrastructure/class.repository.js';
import { ClassUseCase } from '../application/class.usecase.js';
import { ClassController } from './class.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { createClassSchema } from './class.validation.js';

const router = express.Router();

const classRepository = new ClassRepository();
const classUseCase = new ClassUseCase(classRepository);
const classController = new ClassController(classUseCase);

router.use(protect);

// Semua yang login (Admin, Coach, Member) bisa melihat jadwal kelas
router.get('/', asyncHandler(classController.getAllClasses));

// Hanya Admin (atau mungkin ke depan Coach) yang bisa membuat jadwal
router.post(
  '/', 
  restrictTo('Admin'), 
  validate(createClassSchema), 
  asyncHandler(classController.createClass)
);

export default router;