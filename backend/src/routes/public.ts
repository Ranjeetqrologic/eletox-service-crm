import express, { Request, Response } from "express";
import Company from "../models/Company";
import Lead from "../models/Lead";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get(
  "/company",
  asyncHandler(async (_req: Request, res: Response) => {
    const company = await Company.findOne();
    res.json({ success: true, data: company || {} });
  })
);

router.get(
  "/services",
  asyncHandler(async (_req: Request, res: Response) => {
    const services = [
      "AC Repair",
      "AC Installation",
      "AC Gas Filling",
      "AC Maintenance",
      "AMC Plans",
      "Commercial AC",
      "Split AC Repair",
      "Window AC Repair",
      "VRV",
      "Cassette AC",
      "Duct AC",
      "Uninstallation",
    ];
    res.json({ success: true, data: services });
  })
);

router.get(
  "/customer-history/:mobile",
  asyncHandler(async (req: Request, res: Response) => {
    const leads = await Lead.find({ mobile: req.params.mobile }).sort({ createdAt: -1 }).select("-__v");
    res.json({ success: true, count: leads.length, data: leads });
  })
);

export default router;
