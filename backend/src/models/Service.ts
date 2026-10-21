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
  visitCharge?: number;
  content?: {
    image?: string;
    intro?: string;
    includes?: string[];
    problems?: string[];
    brands?: string;
    faqs?: { q: string; a: string }[];
  };
  packages?: { name: string; price: string; gst?: string; desc?: string; img?: string }[];
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
    visitCharge: { type: Number },
    content: { type: Schema.Types.Mixed },
    packages: { type: [Schema.Types.Mixed], default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", ServiceSchema);
