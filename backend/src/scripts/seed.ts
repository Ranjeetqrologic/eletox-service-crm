import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db";
import User from "../models/User";
import Staff from "../models/Staff";
import Company from "../models/Company";
import Service from "../models/Service";

const seed = async () => {
  await connectDB();

  await User.deleteMany({ email: "admin@escm.com" });
  const admin = await User.create({
    name: "Super Admin",
    email: "admin@escm.com",
    password: "Eletox@Admin2026#",
    role: "admin",
    phone: "9999999999",
  });

  await Staff.deleteMany({ employeeId: "EMP001" });
  await Staff.create({
    employeeId: "EMP001",
    user: admin._id,
    name: "Super Admin",
    mobile: "9999999999",
    address: "Eletox HQ",
    role: "admin",
  });

  await Service.deleteMany({});
  await Service.insertMany([
    { title: "AC Repair", slug: "ac-repair", shortDesc: "Quick diagnosis and repair for all AC brands.", description: "Our certified technicians diagnose and repair all AC brands including Split, Window, Cassette and Duct ACs. We fix gas leaks, compressor issues, PCB problems, sensor faults and more. Same-day service available in most areas.", price: 349, order: 1 },
    { title: "AC Installation", slug: "ac-installation", shortDesc: "Safe and professional installation at your home or office.", description: "Professional AC installation by experienced technicians. Includes wall mounting, copper piping, vacuuming, gas charging and proper testing. We handle Split, Window and Cassette AC installations.", price: 799, order: 2 },
    { title: "AC Gas Filling", slug: "ac-gas-filling", shortDesc: "Genuine refrigerant refill with leak detection.", description: "We refill genuine refrigerant gas (R32/R410A/R22) and perform thorough leak detection before filling. No temporary fixes — we find and seal leaks for lasting cooling.", price: 1499, order: 3 },
    { title: "AC Maintenance", slug: "ac-maintenance", shortDesc: "Regular servicing to keep your AC running efficiently.", description: "Comprehensive AC servicing including filter cleaning, coil cleaning, drain pipe cleaning, gas pressure check, electrical inspection and performance testing. Recommended every 3-6 months.", price: 449, order: 4 },
    { title: "AMC Plans", slug: "amc-plans", shortDesc: "Affordable annual maintenance contracts.", description: "Annual Maintenance Contracts for homes and offices. Includes scheduled visits, priority support, discounted repairs and extended warranty on serviced parts.", price: 2499, order: 5 },
    { title: "Commercial AC", slug: "commercial-ac", shortDesc: "Heavy-duty solutions for shops, offices and malls.", description: "Specialized service for commercial AC systems including VRV, VRF, ductable, cassette and package AC units. We serve offices, shops, showrooms and malls.", price: 999, order: 6 },
    { title: "Split AC Repair", slug: "split-ac-repair", shortDesc: "Indoor and outdoor unit service for split ACs.", description: "Expert repair for split AC indoor and outdoor units. We fix cooling issues, noise problems, water leakage, sensor errors, PCB faults and compressor issues.", price: 399, order: 7 },
    { title: "Window AC Repair", slug: "window-ac-repair", shortDesc: "Expert window AC repair and installation.", description: "Window AC repair, installation and uninstallation services. We handle thermostat issues, compressor problems, fan motor replacement and gas refilling.", price: 349, order: 8 },
  ]);

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
  console.log("Default admin: admin@escm.com / Eletox@Admin2026#");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
