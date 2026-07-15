import mongoose, { Schema, Document } from "mongoose";

export interface ILeadStatus extends Document {
  name: string;
  label: string;
  color: string;
  order: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadStatusSchema = new Schema<ILeadStatus>(
  {
    name: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    color: { type: String, default: "#6B7280" },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILeadStatus>("LeadStatus", LeadStatusSchema);
