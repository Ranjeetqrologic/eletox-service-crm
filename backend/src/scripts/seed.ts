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
    { title: "AC Repair & Service", slug: "ac-repair-service", shortDesc: "Quick diagnosis and repair for all AC brands.", description: "Our certified technicians diagnose and repair all AC brands including Split, Window, Cassette and Duct ACs. We fix gas leaks, compressor issues, PCB problems, sensor faults and more. Same-day service available in most areas.", price: 349, order: 1 },
    { title: "AC Installation", slug: "ac-installation", shortDesc: "Safe and professional AC installation at home or office.", description: "Professional AC installation by experienced technicians. Includes wall mounting, copper piping, vacuuming, gas charging and proper testing. We handle Split, Window and Cassette AC installations.", price: 799, order: 2 },
    { title: "AC Pipe Line & Gas Filling", slug: "ac-pipeline-gas-filling", shortDesc: "Genuine refrigerant refill with leak detection and piping.", description: "We refill genuine refrigerant gas (R32/R410A/R22) and perform thorough leak detection. Also provide copper piping installation and replacement for new and existing AC units.", price: 1499, order: 3 },
    { title: "Washing Machine Repair", slug: "washing-machine-repair", shortDesc: "Repair for all types of washing machines.", description: "Expert washing machine repair for semi-automatic, fully automatic, front load and top load models. We fix motor, drum, drainage, PCB and sensor issues.", price: 449, order: 4 },
    { title: "Microwave Repair", slug: "microwave-repair", shortDesc: "Quick microwave and oven repair services.", description: "We repair all brands of microwave ovens including solo, grill and convection models. Common issues like heating problems, keypad faults, door issues and sparking are fixed safely.", price: 399, order: 5 },
    { title: "Geyser Repair & Service", slug: "geyser-repair-service", shortDesc: "Water heater repair and maintenance.", description: "Geyser repair and servicing for electric and gas water heaters. We fix heating elements, thermostats, pressure valves, leakage and safety issues.", price: 499, order: 6 },
    { title: "Water Purifier Repair", slug: "water-purifier-repair", shortDesc: "RO, UV and UF water purifier repair.", description: "Water purifier repair and service for RO, UV, UF and alkaline models. We replace filters, membranes, pumps and fix leakage, low pressure and taste issues.", price: 399, order: 7 },
    { title: "Water Dispenser & Cooler Repair", slug: "water-dispenser-cooler-repair", shortDesc: "Cooling and dispensing appliance repair.", description: "Repair services for water dispensers and water coolers. We fix cooling issues, taps, leakage, compressor problems and thermostat faults.", price: 449, order: 8 },
    { title: "Refrigerator Repair", slug: "refrigerator-repair", shortDesc: "Fridge repair for all brands and types.", description: "Refrigerator repair for single door, double door, side-by-side and commercial fridges. We fix cooling issues, gas refilling, compressor, thermostat and ice maker problems.", price: 549, order: 9 },
    { title: "AC Annual Maintenance", slug: "ac-annual-maintenance", shortDesc: "Regular servicing to keep your AC efficient.", description: "Comprehensive AC servicing including filter cleaning, coil cleaning, drain pipe cleaning, gas pressure check, electrical inspection and performance testing. Recommended every 3-6 months.", price: 449, order: 10 },
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
