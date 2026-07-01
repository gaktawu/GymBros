import express from 'express';
import { PaketMembershipRepository } from '../infrastructure/paketMembership.repository.js';
import { PaketMembershipUseCase } from '../application/paketMembership.usecase.js';
import { PaketMembershipController } from './paketMembership.controller.js';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { validate } from '../../../shared/middlewares/validateMiddleware.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js';
import { createPaketSchema, updateStatusSchema } from './paketMembership.validation.js';
import jwt from 'jsonwebtoken'; // Pastikan library ini tersedia untuk decode token opsional

const router = express.Router();

const paketRepository = new PaketMembershipRepository();
const paketUseCase = new PaketMembershipUseCase(paketRepository);
const paketController = new PaketMembershipController(paketUseCase);

const tryAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret'); 
      req.user = decoded; 
    }
  } catch (err) {
    
  }
  next();
};

router.get('/', tryAuthenticate, asyncHandler(paketController.getAllPaket)); 

router.use(protect);

router.post('/', restrictTo('Admin'), validate(createPaketSchema), asyncHandler(paketController.createPaket));
router.patch('/:id/status', restrictTo('Admin'), validate(updateStatusSchema), asyncHandler(paketController.updateStatus));
router.delete('/:id', restrictTo('Admin'), asyncHandler(paketController.deletePaket));
router.put('/:id', restrictTo('Admin'), asyncHandler(paketController.updatePaket));

export default router;