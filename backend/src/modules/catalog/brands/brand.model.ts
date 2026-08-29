import { Schema, model } from 'mongoose';
import { IBrand } from './brand.types';

const brandSchema = new Schema<IBrand>(
  {
    brandCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    originCountryCode: {
      type: String,
      uppercase: true,
    },
    websiteUrl: {
      type: String,
    },
    logoMediaId: {
      type: Schema.Types.ObjectId,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
brandSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } }); // Case-insensitive unique index for name

export const Brand = model<IBrand>('Brand', brandSchema);
