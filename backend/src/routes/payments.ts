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

router.put(
  "/:id",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id);
    if (!payment) throw new AppError("Payment not found", 404);

    const oldAmount = payment.amount;
    Object.assign(payment, req.body);
    await payment.save();

    const job = await Job.findOne({ lead: payment.lead });
    if (job) {
      const diff = Number(req.body.amount || oldAmount) - oldAmount;
      job.receivedAmount += diff;
      job.pendingAmount = Math.max(0, job.billAmount - job.receivedAmount);
      await job.save();
    }

    res.json({ success: true, data: payment });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id);
    if (!payment) throw new AppError("Payment not found", 404);

    const job = await Job.findOne({ lead: payment.lead });
    if (job) {
      job.receivedAmount -= payment.amount;
      job.pendingAmount = Math.max(0, job.billAmount - job.receivedAmount);
      await job.save();
    }

    await payment.deleteOne();
    res.json({ success: true, message: "Payment deleted" });
  })
);

export default router;
