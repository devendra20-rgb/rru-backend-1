import mongoose, { Schema } from 'mongoose';
import { IMedia } from './media.types';

const mediaSchema = new Schema<IMedia>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ['variant'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      // Ref is dynamic but in our queries we'll manage it
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
