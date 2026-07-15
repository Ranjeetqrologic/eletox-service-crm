import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  title: string;
  slug: string;
  shortDesc: string;
  description: string;
  image?: string;
  price?: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDesc: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    price: { type: Number },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", ServiceSchema);
