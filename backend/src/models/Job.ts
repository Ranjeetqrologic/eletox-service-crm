import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  lead: mongoose.Types.ObjectId;
  staff: mongoose.Types.ObjectId;
  status: "assigned" | "accepted" | "started" | "working" | "half_done" | "need_parts" | "pending" | "follow_up" | "completed" | "cancelled";
  acceptedAt?: Date;
  checkIn: {
    lat?: number;
    lng?: number;
    address?: string;
    time: Date;
  };
  checkOut: {
    lat?: number;
    lng?: number;
    address?: string;
    time: Date;
  };
  beforePhotos: string[];
  workingPhotos: string[];
  afterPhotos: string[];
  videos: string[];
  partsUsed: { name: string; quantity: number; price: number }[];
  expenses: { name: string; amount: number; receipt?: string }[];
  customerRemarks?: string;
  customerSignature?: string;
  technicianSignature?: string;
  workDescription?: string;
  gasFilled?: string;
  repairNotes?: string;
  billAmount: number;
  receivedAmount: number;
  paymentMode?: "cash" | "upi" | "card" | "online";
  pendingAmount: number;
  customerFeedback?: string;
  rating?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true, unique: true },
    staff: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    status: {
      type: String,
      enum: ["assigned", "accepted", "started", "working", "half_done", "need_parts", "pending", "follow_up", "completed", "cancelled"],
      default: "assigned",
    },
    acceptedAt: { type: Date },
    checkIn: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
      time: { type: Date },
    },
    checkOut: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
      time: { type: Date },
    },
    beforePhotos: [{ type: String }],
    workingPhotos: [{ type: String }],
    afterPhotos: [{ type: String }],
    videos: [{ type: String }],
    partsUsed: [{ name: String, quantity: Number, price: Number }],
    expenses: [{ name: String, amount: Number, receipt: String }],
    customerRemarks: { type: String },
    customerSignature: { type: String },
    technicianSignature: { type: String },
    workDescription: { type: String },
    gasFilled: { type: String },
    repairNotes: { type: String },
    billAmount: { type: Number, default: 0 },
    receivedAmount: { type: Number, default: 0 },
    paymentMode: { type: String, enum: ["cash", "upi", "card", "online"] },
    pendingAmount: { type: Number, default: 0 },
    customerFeedback: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IJob>("Job", JobSchema);
