import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
  invoiceNumber: string;
  lead: mongoose.Types.ObjectId;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  items: { description: string; quantity: number; rate: number; amount: number; gstRate?: number }[];
  subtotal: number;
  gstAmount: number;
  total: number;
  isGst: boolean;
  gstNumber?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyLogo?: string;
  upiId?: string;
  qrCode?: string;
  status: "draft" | "sent" | "paid" | "cancelled";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    customerAddress: { type: String },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        rate: { type: Number, required: true, default: 0 },
        amount: { type: Number, required: true, default: 0 },
        gstRate: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    isGst: { type: Boolean, default: false },
    gstNumber: { type: String },
    companyName: { type: String },
    companyAddress: { type: String },
    companyPhone: { type: String },
    companyEmail: { type: String },
    companyLogo: { type: String },
    upiId: { type: String },
    qrCode: { type: String },
    status: { type: String, enum: ["draft", "sent", "paid", "cancelled"], default: "draft" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
