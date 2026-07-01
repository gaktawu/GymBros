import { Router } from 'express';
import { ClassController } from './class.controller.js';
import { ClassUseCase } from '../application/class.usecase.js';
import { ClassRepository } from '../infrastructure/class.repository.js';
import { validateClassInput, validateIdParam } from './class.validation.js';

const router = Router();
const repository = new ClassRepository();
const usecase = new ClassUseCase(repository);
const controller = new ClassController(usecase);

router.get('/', controller.getAllClasses);
router.get('/:id', validateIdParam, controller.getClassById);
router.post('/', validateClassInput, controller.createClass);
router.put('/:id', validateIdParam, validateClassInput, controller.updateClass);
router.delete('/:id', validateIdParam, controller.deleteClass);
router.get('/:id/participants', validateIdParam, controller.getParticipants);

export default router;