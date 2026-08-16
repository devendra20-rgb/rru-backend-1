import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { sendSuccess } from '../../utils/response';

export class UserController {
  constructor(private readonly userService: UserService) {}

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.createUser(req.body);
      sendSuccess(res, 201, 'User created successfully', user);
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters: any = {};
      if (req.query.role) filters.role = req.query.role;
      if (req.query.status) filters.status = req.query.status;

      const { users, total } = await this.userService.getAllUsers(filters, page, limit);

      sendSuccess(res, 200, 'Users retrieved successfully', users, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.params.id as string);
      sendSuccess(res, 200, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.updateUser(req.params.id as string, req.body);
      sendSuccess(res, 200, 'User updated successfully', user);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.deleteUser(req.params.id as string);
      sendSuccess(res, 200, 'User deleted successfully', user);
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const user = await this.userService.getUserById(userId);
      sendSuccess(res, 200, 'Current user retrieved', user);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;
      await this.userService.changePassword(userId, currentPassword, newPassword);
      sendSuccess(res, 200, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  };
}
