import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db";
import User from "../models/User";
import Staff from "../models/Staff";
import Company from "../models/Company";
import Service from "../models/Service";
import Banner from "../models/Banner";
import Gallery from "../models/Gallery";

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
    { title: "AC Repair & Service", slug: "ac-repair-service", shortDesc: "Quick diagnosis and repair for all AC brands.", description: "Our certified technicians diagnose and repair all AC brands including Split, Window, Cassette and Duct ACs. We fix gas leaks, compressor issues, PCB problems, sensor faults and more. Same-day service available in most areas.", image: "/eletox-assets/icon-ac.png", price: 349, order: 1 },
    { title: "AC Pipe Line", slug: "ac-pipe-line", shortDesc: "Copper pipe line, drain pipe and wiring fitting with sleeves.", description: "AC copper pipe wall/underground fitting with sleeves, wire and drain pipe. We also refill genuine refrigerant gas (R32/R410A/R22) with thorough leak detection for new and existing AC units.", image: "/eletox-assets/icon-pipe.jpg", price: 1499, order: 2 },
    { title: "Washing Machine Repair", slug: "washing-machine-repair", shortDesc: "Repair for all types of washing machines.", description: "Expert washing machine repair for semi-automatic, fully automatic, front load and top load models. We fix motor, drum, drainage, PCB and sensor issues.", image: "/eletox-assets/icon-washing.jpg", price: 449, order: 3 },
    { title: "Microwave Repair", slug: "microwave-repair", shortDesc: "Quick microwave and oven repair services.", description: "We repair all brands of microwave ovens including solo, grill and convection models. Common issues like heating problems, keypad faults, door issues and sparking are fixed safely.", image: "/eletox-assets/icon-microwave.jpg", price: 399, order: 4 },
    { title: "Geyser Repair & Service", slug: "geyser-repair-service", shortDesc: "Water heater repair and maintenance.", description: "Geyser repair and servicing for electric and gas water heaters. We fix heating elements, thermostats, pressure valves, leakage and safety issues.", image: "/eletox-assets/icon-geyser.png", price: 499, order: 5 },
    { title: "Water Purifier Repair & Service", slug: "water-purifier-repair", shortDesc: "RO, UV and UF water purifier repair.", description: "Water purifier repair and service for RO, UV, UF and alkaline models. We replace filters, membranes, pumps and fix leakage, low pressure and taste issues.", image: "/eletox-assets/icon-purifier.png", price: 399, order: 6 },
    { title: "Water Dispenser Repair & Services", slug: "water-dispenser-repair", shortDesc: "Hot & cold water dispenser repair and maintenance.", description: "Repair services for hot & cold water dispensers. We fix cooling and heating issues, taps, leakage, compressor problems and thermostat faults.", image: "/eletox-assets/icon-dispenser.jpg", price: 449, order: 7 },
    { title: "Water Cooler Repair & Services", slug: "water-cooler-repair", shortDesc: "Commercial & domestic water cooler repair and gas charging.", description: "Water cooler repair for domestic and commercial units. We fix cooling issues, gas charging, compressor, thermostat and leakage problems.", image: "/eletox-assets/icon-cooler.jpg", price: 549, order: 8 },
    { title: "Electrician", slug: "electrician", shortDesc: "Certified electrician for wiring, fittings and electrical faults.", description: "Certified electricians for house wiring, switchboard and MCB fitting, fan/light installation, short-circuit and electrical fault repair.", image: "/eletox-assets/icon-electrician.png", price: 299, order: 9 },
  ]);

  await Banner.deleteMany({});
  await Banner.insertMany([
    { title: "Residential Repair Service", subtitle: "On your fingertips you have been cooling switch", image: "/eletox-assets/hero-1.jpg", buttonText: "Get Free Estimate", buttonLink: "#book", order: 1 },
    { title: "AC & Appliance Repair", subtitle: "Fast and reliable service at your doorstep", image: "/eletox-assets/hero-2.jpg", buttonText: "Book Now", buttonLink: "#book", order: 2 },
  ]);

  await Gallery.deleteMany({});
  await Gallery.insertMany([
    { title: "AC Service", image: "/eletox-assets/about-1.jpg", category: "service", order: 1 },
    { title: "Technician", image: "/eletox-assets/about-2.jpg", category: "team", order: 2 },
    { title: "Equipment", image: "/eletox-assets/icon-pipe.jpg", category: "service", order: 3 },
    { title: "Washing Machine", image: "/eletox-assets/icon-washing.jpg", category: "service", order: 4 },
  ]);

  await Company.findOneAndUpdate(
    {},
    {
      name: "Eletox AC Services",
      tagline: "Fast, Reliable AC & Appliance Repair Services",
      address: "Tilak Vihar, Gokulpura, near Gs Swimming Pool, Jhotwara, Jaipur, Rajasthan 302012",
      phone: "+91 9571071342",
      whatsapp: "+91 9571071342",
      email: "eletox07@gmail.com",
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
