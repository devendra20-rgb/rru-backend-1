import { Schema, model } from 'mongoose';
import { IArticle } from './article.types';

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    featuredImage: { type: Schema.Types.ObjectId, ref: 'Media' },
    category: { type: String, required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['published', 'draft', 'archived'], default: 'draft', index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

articleSchema.index({ slug: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ title: 'text', excerpt: 'text' }); // for search

export const Article = model<IArticle>('Article', articleSchema);
