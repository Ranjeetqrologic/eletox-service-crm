import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
  employeeId: string;
  user: mongoose.Types.ObjectId;
  name: string;
  fatherName?: string;
  dob?: Date;
  mobile: string;
  email?: string;
  address: string;
  photo?: string;
  aadharFront?: string;
  aadharBack?: string;
  pan?: string;
  drivingLicense?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
    upi?: string;
  };
  emergencyContact?: string;
  joiningDate?: Date;
  salary?: number;
  role: "superadmin" | "admin" | "manager" | "account" | "technician";
  documents: { name: string; url: string; type?: string }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    employeeId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    fatherName: { type: String },
    dob: { type: Date },
    mobile: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    photo: { type: String },
    aadharFront: { type: String },
    aadharBack: { type: String },
    pan: { type: String },
    drivingLicense: { type: String },
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      ifsc: { type: String },
      upi: { type: String },
    },
    emergencyContact: { type: String },
    joiningDate: { type: Date },
    salary: { type: Number },
    role: { type: String, enum: ["superadmin", "admin", "manager", "account", "technician"], default: "technician" },
    documents: [{ name: String, url: String, type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStaff>("Staff", StaffSchema);
