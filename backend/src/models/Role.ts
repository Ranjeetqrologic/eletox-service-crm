import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  permissions: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String }],
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRole>("Role", RoleSchema);
