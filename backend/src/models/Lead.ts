import mongoose, { Schema, Document } from "mongoose";

export type LeadStatus =
  | "new"
  | "assigned"
  | "accepted"
  | "on_the_way"
  | "reached"
  | "working"
  | "need_parts"
  | "pending"
  | "follow_up"
  | "completed"
  | "cancelled"
  | "closed";

export interface ILead extends Document {
  leadId: string;
  customerName: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  address: string;
  pin?: string;
  state?: string;
  city: string;
  lat?: number;
  lng?: number;
  source: string;
  service: string;
  acType?: string;
  problem?: string;
  priority: "low" | "medium" | "high" | "urgent";
  preferredDate?: Date;
  preferredTime?: string;
  remarks?: string;
  status: LeadStatus;
  assignedStaff?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  closedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  cancelledReason?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    leadId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    alternateMobile: { type: String },
    email: { type: String },
    address: { type: String, required: true },
    pin: { type: String },
    state: { type: String },
    city: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    source: {
      type: String,
      enum: ["website", "call", "whatsapp", "facebook", "instagram", "google_ads", "referral", "manual", "others"],
      default: "manual",
    },
    service: { type: String, required: true },
    acType: { type: String },
    problem: { type: String },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    preferredDate: { type: Date },
    preferredTime: { type: String },
    remarks: { type: String },
    status: {
      type: String,
      enum: [
        "new",
        "assigned",
        "accepted",
        "on_the_way",
        "reached",
        "working",
        "need_parts",
        "pending",
        "follow_up",
        "completed",
        "cancelled",
        "closed",
      ],
      default: "new",
    },
    assignedStaff: { type: Schema.Types.ObjectId, ref: "Staff" },
    assignedAt: { type: Date },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    closedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    cancelledReason: { type: String },
    images: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<ILead>("Lead", LeadSchema);
