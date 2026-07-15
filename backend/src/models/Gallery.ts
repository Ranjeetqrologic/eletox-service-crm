import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
  title?: string;
  image: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String },
    image: { type: String, required: true },
    category: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IGallery>("Gallery", GallerySchema);
