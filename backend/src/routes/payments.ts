import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Payment from "../models/Payment";
import Lead from "../models/Lead";
import Job from "../models/Job";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const { lead, mode } = req.query;
    const filter: any = {};
    if (lead) filter.lead = lead;
    if (mode) filter.mode = mode;

    const payments = await Payment.find(filter)
      .populate("lead", "customerName leadId")
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  [
    body("lead").notEmpty(),
    body("amount").isFloat({ min: 0 }),
    body("mode").isIn(["cash", "upi", "card", "online"]),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const lead = await Lead.findById(req.body.lead);
    if (!lead) throw new AppError("Lead not found", 404);

    const payment = await Payment.create({
      ...req.body,
      receivedBy: req.user?._id,
    });

    const job = await Job.findOne({ lead: req.body.lead });
    if (job) {
      job.receivedAmount += Number(req.body.amount);
      job.pendingAmount = Math.max(0, job.billAmount - job.receivedAmount);
      await job.save();
    }

    res.status(201).json({ success: true, data: payment });
  })
);

export default router;
