import { Router } from 'express';
import { ClassController } from './class.controller.js';
import { ClassUseCase } from '../application/class.usecase.js';
import { ClassRepository } from '../infrastructure/class.repository.js';
import { validateClassInput, validateIdParam } from './class.validation.js';
import { protect, restrictTo } from '../../../shared/middlewares/authMiddleware.js'; 

const router = Router();
const repository = new ClassRepository();
const usecase = new ClassUseCase(repository);
const controller = new ClassController(usecase);

router.get('/', controller.getAllClasses);

router.use(protect);

router.get('/admin/all', restrictTo('Admin'), controller.getAllClassesAdmin);
router.get('/my-classes', restrictTo('Coach'), controller.getMyCoachClasses);

router.get('/my-bookings', restrictTo('Member'), controller.getMyBookings); 

router.get('/:id', validateIdParam, controller.getClassById);
router.post('/', restrictTo('Admin'), validateClassInput, controller.createClass);
router.put('/:id', restrictTo('Admin'), validateIdParam, validateClassInput, controller.updateClass);
router.delete('/:id', restrictTo('Admin'), validateIdParam, controller.deleteClass);
router.get('/:id/participants', restrictTo('Admin', 'Coach'), validateIdParam, controller.getParticipants);

export default router;