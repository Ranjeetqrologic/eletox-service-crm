import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  staff: mongoose.Types.ObjectId;
  date: Date;
  checkIn: {
    time: Date;
    lat?: number;
    lng?: number;
    address?: string;
  };
  checkOut?: {
    time: Date;
    lat?: number;
    lng?: number;
    address?: string;
  };
  workingHours?: number;
  leaveType?: "sick" | "casual" | "paid" | "holiday";
  status: "present" | "absent" | "leave" | "half_day" | "holiday";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    staff: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    date: { type: Date, required: true },
    checkIn: {
      time: { type: Date },
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    checkOut: {
      time: { type: Date },
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    workingHours: { type: Number },
    leaveType: { type: String, enum: ["sick", "casual", "paid", "holiday"] },
    status: { type: String, enum: ["present", "absent", "leave", "half_day", "holiday"], default: "present" },
    notes: { type: String },
  },
  { timestamps: true }
);

AttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
