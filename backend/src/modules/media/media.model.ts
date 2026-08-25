import mongoose, { Schema } from 'mongoose';
import { IMedia } from './media.types';

const mediaSchema = new Schema<IMedia>(
  {
    folder: {
      type: String,
    },
    entityType: {
      type: String,
      enum: ['variant', 'brand', 'model', 'generation'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      // Ref is dynamic but in our queries we'll manage it
    },
    colorId: {
      type: Schema.Types.ObjectId,
      ref: 'Color',
      default: null,
      // Optional: links this image to a specific paint color of the variant
    },
    angleTag: {
      type: String,
      enum: ['exterior-front', 'exterior-rear', 'exterior-side', 'interior', 'detail', 'overhead', '360-frame'],
      default: null,
      // Optional: describes the shot angle/type for grouping
    },
    mediaType: {
      type: String,
      required: true,
      enum: ['image', 'video'],
      default: 'image',
    },
    storageProvider: {
      type: String,
      required: true,
      enum: ['local', 's3'],
      default: 'local',
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    altText: {
      type: String,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
mediaSchema.index({ entityType: 1, entityId: 1, status: 1 });
mediaSchema.index({ entityType: 1, entityId: 1, isPrimary: 1 });

// Ensure only one primary media per entity (this is handled in service to be safe,
// but we can also use partial index if needed. However, since multiple could be false,
// a simple unique sparse index on isPrimary=true is possible, but service layer control is safer
// since we need to unset the previous one automatically).

export const Media = mongoose.model<IMedia>('Media', mediaSchema);
