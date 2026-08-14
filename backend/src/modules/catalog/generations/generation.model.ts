import { Schema, model } from 'mongoose';
import { IGeneration } from './generation.types';

const generationSchema = new Schema<IGeneration>(
  {
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'Model',
      required: true,
    },
    generationCode: {
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
    generationNumber: {
      type: Number,
    },
    startYear: {
      type: Number,
    },
    endYear: {
      type: Number,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
generationSchema.index({ modelId: 1 });
generationSchema.index(
  { modelId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

export const Generation = model<IGeneration>('Generation', generationSchema);
