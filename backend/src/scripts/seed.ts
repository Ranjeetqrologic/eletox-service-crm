import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db";
import User from "../models/User";
import Staff from "../models/Staff";
import Company from "../models/Company";

const seed = async () => {
  await connectDB();

  await User.deleteMany({ email: "admin@escm.com" });
  const admin = await User.create({
    name: "Super Admin",
    email: "admin@escm.com",
    password: "admin123",
    role: "superadmin",
    phone: "9999999999",
  });

  await Staff.deleteMany({ employeeId: "EMP001" });
  await Staff.create({
    employeeId: "EMP001",
    user: admin._id,
    name: "Super Admin",
    mobile: "9999999999",
    address: "Eletox HQ",
    role: "manager",
  });

  await Company.findOneAndUpdate(
    {},
    {
      name: "Eletox AC Services",
      tagline: "Fast, Reliable AC Repair & Maintenance",
      address: "123 Main Road, New Delhi",
      phone: "+91-9999999999",
      whatsapp: "+91-9999999999",
      email: "info@eletox.com",
      website: "https://eletox.com",
    },
    { upsert: true, new: true }
  );

  console.log("Seed completed.");
  console.log("Default admin: admin@escm.com / admin123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
