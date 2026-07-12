import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  lead: mongoose.Types.ObjectId;
  invoice?: mongoose.Types.ObjectId;
  job?: mongoose.Types.ObjectId;
  amount: number;
  mode: "cash" | "upi" | "card" | "online";
  status: "pending" | "advance" | "received";
  receivedBy: mongoose.Types.ObjectId;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    invoice: { type: Schema.Types.ObjectId, ref: "Invoice" },
    job: { type: Schema.Types.ObjectId, ref: "Job" },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["cash", "upi", "card", "online"], required: true },
    status: { type: String, enum: ["pending", "advance", "received"], default: "received" },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transactionId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
