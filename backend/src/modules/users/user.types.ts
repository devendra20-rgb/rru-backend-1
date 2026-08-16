import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'editor';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'editor';
  status?: 'active' | 'inactive';
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  role?: 'admin' | 'editor';
  status?: 'active' | 'inactive';
}
