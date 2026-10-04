import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  phone?: string;
  lastLogin?: Date;
  trustedDevices: { deviceId: string; label?: string; lastUsed: Date }[];
  otpHash?: string;
  otpExpires?: Date;
  otpPurpose?: string;
  otpDeviceId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, lowercase: true, trim: true, default: "technician" },
    isActive: { type: Boolean, default: true },
    phone: { type: String },
    lastLogin: { type: Date },
    trustedDevices: { type: [{ deviceId: String, label: String, lastUsed: Date }], default: [], select: false },
    otpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpPurpose: { type: String, select: false },
    otpDeviceId: { type: String, select: false },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
