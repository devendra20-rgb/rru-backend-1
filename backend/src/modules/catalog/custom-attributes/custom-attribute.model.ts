import { Schema, model } from 'mongoose';
import { ICustomAttribute } from './custom-attribute.types';

const customAttributeSchema = new Schema<ICustomAttribute>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multi-select'],
      required: true,
    },
    unit: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    appliesTo: {
      type: String,
      enum: ['vehicle', 'variant', 'all'],
      default: 'variant',
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    options: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

customAttributeSchema.index({ key: 1 });
customAttributeSchema.index({ status: 1 });
customAttributeSchema.index({ appliesTo: 1 });
customAttributeSchema.index({ sortOrder: 1 });

export const CustomAttribute = model<ICustomAttribute>('CustomAttribute', customAttributeSchema);
