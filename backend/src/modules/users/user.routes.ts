import { Router } from 'express';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  changePasswordSchema,
} from './user.validation';

const router = Router();

// DI Setup
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Require authentication for all user routes
router.use(authenticate);

// Me endpoints
router.get('/me', userController.getMe);
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);

// Admin-only endpoints for user management
router.use(authorize('admin'));

router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', validate(getUserSchema), userController.getUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', validate(getUserSchema), userController.deleteUser);

export default router;
