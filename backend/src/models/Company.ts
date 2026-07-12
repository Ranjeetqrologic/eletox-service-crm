import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  tagline?: string;
  logo?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  gstNumber?: string;
  upiId?: string;
  qrCode?: string;
  googleMapsApiKey?: string;
  smsApi?: { provider?: string; apiKey?: string; senderId?: string };
  whatsappApi?: { provider?: string; apiKey?: string; url?: string };
  emailSmtp?: { host?: string; port?: number; user?: string; pass?: string; secure?: boolean };
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; youtube?: string };
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, default: "Eletox AC Services" },
    tagline: { type: String },
    logo: { type: String },
    address: { type: String },
    phone: { type: String },
    whatsapp: { type: String },
    email: { type: String },
    website: { type: String },
    gstNumber: { type: String },
    upiId: { type: String },
    qrCode: { type: String },
    googleMapsApiKey: { type: String },
    smsApi: { provider: String, apiKey: String, senderId: String },
    whatsappApi: { provider: String, apiKey: String, url: String },
    emailSmtp: { host: String, port: Number, user: String, pass: String, secure: Boolean },
    socialLinks: { facebook: String, instagram: String, twitter: String, youtube: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>("Company", CompanySchema);
