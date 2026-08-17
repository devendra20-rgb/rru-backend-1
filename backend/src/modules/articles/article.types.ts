import { Document, Types } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: Types.ObjectId;
  category: string;
  authorId: Types.ObjectId;
  status: 'published' | 'draft' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetArticlesQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: string;
  authorId: string;
  status?: 'published' | 'draft' | 'archived';
  publishedAt?: string;
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  category?: string;
  status?: 'published' | 'draft' | 'archived';
  publishedAt?: string;
}
